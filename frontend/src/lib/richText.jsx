/**
 * Minimal inline-markdown renderer for assistant text.
 *
 * `n8nClient.markdownToBlocks` handles block structure (headings, lists,
 * tables); this handles inline spans inside those blocks: **bold**,
 * *italic* / _italic_, and `code`. Anything else passes through as plain
 * text — no new dependencies, no raw HTML injection.
 */
const TOKEN_PATTERN = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_)/g

function renderToken(token, key) {
  if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
    return <strong key={key}>{token.slice(2, -2)}</strong>
  }
  if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
    return (
      <code
        key={key}
        className="rounded bg-white/[0.07] px-1 py-px font-mono text-[0.92em] text-ink-primary"
      >
        {token.slice(1, -1)}
      </code>
    )
  }
  if (
    (token.startsWith('*') && token.endsWith('*') && token.length > 2) ||
    (token.startsWith('_') && token.endsWith('_') && token.length > 2)
  ) {
    return <em key={key}>{token.slice(1, -1)}</em>
  }
  return token
}

/** @param {string} text @returns {(string|JSX.Element)[]} */
export function renderRichText(text) {
  if (typeof text !== 'string' || !text) return [text ?? '']
  return text.split(TOKEN_PATTERN).map(renderToken)
}
