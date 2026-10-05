/**
 * Conversation seed data + prompt suggestions.
 *
 * NOTE — the pre-loaded PAYE demo thread has been pruned ahead of the n8n
 * hookup. This module now only seeds an empty history; real messages arrive
 * from `lib/n8nClient` (live) or `lib/mockService` (unconfigured fallback)
 * in the same message shape the renderer depends on:
 *
 *   {
 *     id: string,
 *     role: 'user' | 'assistant',
 *     createdAt: string (ISO),
 *     text?: string,               // user messages
 *     attachments?: { name, size }[],
 *     blocks?: Block[]             // assistant messages
 *   }
 *
 * Block union:
 *   { type: 'paragraph', text }
 *   { type: 'heading', text }
 *   { type: 'list', ordered?, items: string[] }
 *   { type: 'table', columns: string[], align?: ('text'|'num')[], rows: string[][], caption? }
 *   { type: 'callout', tone: 'accent'|'warning', title?, text }
 *   { type: 'citations', items: { label, meta }[] }
 */

function seedConversation(id, title, group, ageMs) {
  return {
    id,
    title,
    group,
    updatedAt: new Date(Date.now() - ageMs).toISOString(),
    messages: [],
  }
}

export const MOCK_CONVERSATIONS = [
  seedConversation('c-1', 'New conversation', 'Today', 1000 * 60 * 2),
]

export const INITIAL_CONVERSATION_ID = 'c-1'

export const PROMPT_SUGGESTIONS = [
  'Explain how PAYE is structured on a monthly payslip',
  'What does Turnover Tax apply to?',
  'What happens if a return is filed late?',
  'How is rental income treated for tax?',
]
