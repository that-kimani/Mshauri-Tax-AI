/**
 * n8n service layer.
 *
 * Replaces `lib/mockService` as the primary message sender. The component
 * tree and `hooks/useChat` never talk to n8n directly — they call
 * `sendMessage`, which resolves to the SAME assistant-message shape the
 * mock returns, so no renderer changes are required.
 *
 * Configuration (see `frontend/.env.example` — commit that, never `.env`):
 *   VITE_N8N_WEBHOOK_URL  — full https URL of the n8n chat webhook.
 *   VITE_N8N_API_TOKEN    — optional header token (sent as `Authorization: Bearer <token>`).
 *   VITE_N8N_TIMEOUT_MS   — optional, defaults to 60000 (LLM + RAG is slow).
 *
 * Payload intentionally covers both n8n trigger styles:
 *   - AI Chat / agent nodes expect `{ chatInput, sessionId }`
 *   - Custom webhooks can read `{ text, conversationId, attachments, history }`
 *
 * Response handling: the confirmed workflow shape is `[{ output: <markdown> }]`
 * and `output` is read as the message source. Other text-like shapes
 * (`{ text | message | reply | answer }`, OpenAI-style choices, or the
 * native `{ blocks }` shape) are also accepted so the UI keeps working if
 * the workflow output evolves.
 */

/** @typedef {{ name: string, size: number }} AttachmentMeta */

const DEFAULT_TIMEOUT_MS = 60000

function readEnv(name) {
  const value = import.meta.env?.[name]
  return typeof value === 'string' ? value.trim() : ''
}

export function getN8nConfig() {
  const timeoutRaw = readEnv('VITE_N8N_TIMEOUT_MS')
  const timeout = Number.parseInt(timeoutRaw, 10)
  return {
    url: readEnv('VITE_N8N_WEBHOOK_URL'),
    token: readEnv('VITE_N8N_API_TOKEN'),
    timeoutMs:
      Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT_MS,
  }
}

/** True when a webhook URL is configured — i.e. live calls are possible. */
export function isN8nConfigured() {
  return getN8nConfig().url.length > 0
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * n8n frequently wraps rows as `[{ json: {...} }]`. Unwrap one level of
 * array / `.json` / `.data` envelopes before looking for text.
 */
function unwrapEnvelope(payload) {
  let current = payload
  for (let depth = 0; depth < 3; depth += 1) {
    if (Array.isArray(current)) {
      if (current.length === 0) return undefined
      current = current[0]
      continue
    }
    if (isPlainObject(current) && isPlainObject(current.json)) {
      current = current.json
      continue
    }
    break
  }
  return current
}

const TEXT_KEYS = [
  'output',
  'text',
  'message',
  'reply',
  'answer',
  'response',
  'result',
  'content',
]

/** Pulls human-readable text out of whatever the workflow returned. */
function extractText(payload) {
  const unwrapped = unwrapEnvelope(payload)

  if (typeof unwrapped === 'string') return unwrapped.trim()

  if (isPlainObject(unwrapped)) {
    for (const key of TEXT_KEYS) {
      const value = unwrapped[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
    // OpenAI-style: { choices: [{ message: { content } }] }
    const choice = unwrapped.choices?.[0]?.message?.content
    if (typeof choice === 'string' && choice.trim()) return choice.trim()
    if (Array.isArray(choice)) {
      const joined = choice
        .map((part) =>
          typeof part === 'string' ? part : part?.text ?? '',
        )
        .join('')
        .trim()
      if (joined) return joined
    }
    // One level of nesting: { data: { output } }
    if (isPlainObject(unwrapped.data)) {
      const nested = extractText(unwrapped.data)
      if (nested) return nested
    }
  }

  return ''
}

function isValidBlock(block) {
  if (!isPlainObject(block) || typeof block.type !== 'string') return false
  switch (block.type) {
    case 'paragraph':
    case 'heading':
      return typeof block.text === 'string' && block.text.trim().length > 0
    case 'list':
      return (
        Array.isArray(block.items) &&
        block.items.every((item) => typeof item === 'string')
      )
    case 'table':
      return (
        Array.isArray(block.columns) &&
        Array.isArray(block.rows) &&
        block.rows.every((row) => Array.isArray(row))
      )
    case 'callout':
      return typeof block.text === 'string'
    case 'citations':
      return (
        Array.isArray(block.items) &&
        block.items.every((item) => typeof item?.label === 'string')
      )
    default:
      return false
  }
}

/**
 * Minimal markdown → blocks converter. No new dependencies on purpose:
 * the renderer only understands the Block union, so headings, lists,
 * pipe tables and paragraphs are mapped; everything else degrades to a
 * paragraph instead of throwing.
 */
export function markdownToBlocks(markdown) {
  const source = typeof markdown === 'string' ? markdown : ''
  const lines = source.split(/\r?\n/)
  const blocks = []
  let paragraph = []
  let list = null // { ordered: boolean, items: string[] }
  let tableLines = []

  const flushParagraph = () => {
    const text = paragraph.join('\n').trim()
    if (text) blocks.push({ type: 'paragraph', text })
    paragraph = []
  }

  const flushList = () => {
    if (list && list.items.length > 0) {
      blocks.push({ type: 'list', ordered: list.ordered, items: list.items })
    }
    list = null
  }

  const flushTable = () => {
    if (tableLines.length >= 2) {
      const parseRow = (line) =>
        line
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((cell) => cell.trim())
      const columns = parseRow(tableLines[0])
      // Line 2 is the `| --- |` separator — skip it.
      const rows = tableLines.slice(2).map(parseRow)
      if (columns.length > 0) {
        const align = columns.map((_, i) =>
          rows.every((row) => /^-?[\d,.\s%]+$/.test(row[i] ?? '')) &&
          rows.length > 0
            ? 'num'
            : 'text',
        )
        blocks.push({ type: 'table', columns, align, rows })
      }
    }
    tableLines = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      flushList()
      flushTable()
      continue
    }

    if (/^\|.*\|$/.test(line)) {
      flushParagraph()
      flushList()
      tableLines.push(line)
      continue
    }
    if (tableLines.length > 0) flushTable()

    const heading = line.match(/^(#{1,3})\s+(.*)$/)
    if (heading) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'heading', text: heading[2].trim() })
      continue
    }

    const quote = line.match(/^>\s?(.*)$/)
    if (quote && quote[1]) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'callout', tone: 'accent', text: quote[1].trim() })
      continue
    }

    const bullet = line.match(/^[-*+]\s+(.*)$/)
    const numbered = line.match(/^\d+[.)]\s+(.*)$/)
    if (bullet || numbered) {
      flushParagraph()
      const ordered = Boolean(numbered)
      const item = (bullet?.[1] ?? numbered?.[1] ?? '').trim()
      if (!list || list.ordered !== ordered) {
        flushList()
        list = { ordered, items: [] }
      }
      if (item) list.items.push(item)
      continue
    }

    if (/^(-{3,}|\*{3,})$/.test(line)) continue // thematic break — skip

    flushList()
    paragraph.push(rawLine.trim())
  }

  flushParagraph()
  flushList()
  flushTable()

  if (blocks.length === 0 && source.trim()) {
    blocks.push({ type: 'paragraph', text: source.trim() })
  }
  return blocks
}

/**
 * Accepts either the native `{ blocks }` shape or anything text-like and
 * returns a renderer-ready assistant message.
 */
export function normalizeToMessage(raw, { fallbackText = '' } = {}) {
  const unwrapped = unwrapEnvelope(raw)

  if (isPlainObject(unwrapped) && Array.isArray(unwrapped.blocks)) {
    const blocks = unwrapped.blocks.filter(isValidBlock)
    if (blocks.length > 0) {
      return {
        id: unwrapped.id ?? `m-${Date.now()}`,
        role: 'assistant',
        createdAt: unwrapped.createdAt ?? new Date().toISOString(),
        blocks,
      }
    }
  }

  const text = extractText(raw) || fallbackText.trim()
  if (!text) throw new Error('n8n returned an empty reply')
  return {
    id: `m-${Date.now()}`,
    role: 'assistant',
    createdAt: new Date().toISOString(),
    blocks: markdownToBlocks(text),
  }
}

/**
 * @param {{ text: string, attachments?: AttachmentMeta[], conversationId?: string, history?: { role: string, text: string }[] }} payload
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<object>} an assistant message in the Block shape
 */
export async function sendMessage(
  { text, attachments = [], conversationId, history = [] },
  options = {},
) {
  const { url, token, timeoutMs } = getN8nConfig()
  if (!url) throw new Error('n8n is not configured (VITE_N8N_WEBHOOK_URL is empty)')

  const trimmed = text.trim()
  if (!trimmed) throw new Error('Cannot send an empty message')

  const externalSignal = options.signal
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  const onExternalAbort = () => controller.abort()
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort()
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true })
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        // n8n AI-chat style keys…
        chatInput: trimmed,
        sessionId: conversationId ?? 'default',
        // …plus explicit keys for custom webhooks.
        text: trimmed,
        conversationId: conversationId ?? 'default',
        attachments: attachments.map(({ name, size }) => ({ name, size })),
        history,
      }),
    })

    if (!response.ok) {
      throw new Error(`n8n request failed (HTTP ${response.status})`)
    }

    const contentType = response.headers.get('content-type') ?? ''
    const raw = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    return normalizeToMessage(raw, { fallbackText: typeof raw === 'string' ? raw : '' })
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(`n8n timed out after ${timeoutMs}ms`)
    }
    throw err instanceof Error ? err : new Error('n8n request failed')
  } finally {
    clearTimeout(timeoutId)
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort)
    }
  }
}
