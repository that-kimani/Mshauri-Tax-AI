/**
 * Mock service layer.
 *
 * This module exists so that `useChat` never knows where messages come
 * from. Swapping it for the real Mshauri API means replacing the body of
 * `sendMessage` with a fetch/stream call that resolves to the same
 * message shape — no component changes required.
 *
 * It performs NO tax logic. It returns canned demonstration content.
 */

const RESPONSE_LATENCY_MS = 1150

/** Flip to `true` to preview the error state in the UI. */
const FORCE_FAILURE = false

function buildDemoReply(question) {
  const trimmed = question.trim()
  const topic = trimmed.length > 90 ? `${trimmed.slice(0, 90)}…` : trimmed

  return {
    id: `m-${Date.now()}`,
    role: 'assistant',
    createdAt: new Date().toISOString(),
    blocks: [
      {
        type: 'callout',
        tone: 'accent',
        title: 'Prototype response',
        text: 'This interface is a frontend prototype. It renders the shape of a Mshauri answer but does not compute tax. Once the Mshauri service is connected, this placeholder is replaced by a real, sourced response.',
      },
      {
        type: 'paragraph',
        text: `You asked: “${topic}”`,
      },
      {
        type: 'heading',
        text: 'What a full Mshauri answer would contain',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'A direct answer in plain language, with the relevant Kenyan tax head named.',
          'The statutory basis, cited so you can verify it independently.',
          'A worked example with clearly labelled assumptions.',
          'The practical next step — what to file, where, and by when.',
          'Any caveat that could change the answer, such as filing status or turnover band.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Structured figures, where relevant, are rendered as tables so amounts stay scannable and aligned.',
      },
      {
        type: 'citations',
        items: [
          { label: 'Income Tax Act', meta: 'Primary legislation' },
          { label: 'Tax Procedures Act', meta: 'Administration' },
        ],
      },
    ],
  }
}

/**
 * @param {{ text: string, attachments?: {name:string,size:number}[] }} payload
 * @returns {Promise<object>} an assistant message
 */
export function sendMessage({ text }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (FORCE_FAILURE) {
        reject(new Error('Mock service failure'))
        return
      }
      resolve(buildDemoReply(text))
    }, RESPONSE_LATENCY_MS)
  })
}
