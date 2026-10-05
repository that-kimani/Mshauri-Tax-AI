import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MOCK_CONVERSATIONS, INITIAL_CONVERSATION_ID } from '../data/mockConversations'
import { sendMessage as mockSend } from '../lib/mockService'
import { sendMessage as n8nSend, isN8nConfigured } from '../lib/n8nClient'
import { blocksToPlainText } from '../lib/blocksToPlainText'

/**
 * Flattens stored messages to the lightweight `{ role, text }` history
 * the backend expects. Assistant blocks are flattened to plain text so
 * n8n never needs to understand the renderer's Block union.
 */
function toHistory(messages) {
  return messages
    .map((m) => {
      if (m.role === 'user') return { role: 'user', text: m.text ?? '' }
      if (m.role === 'assistant') {
        return { role: 'assistant', text: blocksToPlainText(m.blocks ?? []) }
      }
      return null
    })
    .filter((entry) => entry && entry.text.trim().length > 0)
}

/**
 * Owns all conversation state.
 *
 * The component tree never talks to the data source directly — it calls
 * `sendMessage`, `selectConversation`, `startNewChat`, etc. When the real
 * Mshauri API lands, only this hook and `lib/mockService` change.
 */
export function useChat() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS)
  const [activeId, setActiveId] = useState(INITIAL_CONVERSATION_ID)
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'error'
  const [error, setError] = useState(null)

  // Guards against a stale async resolution writing into the wrong thread.
  const requestRef = useRef(0)

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  )

  const messages = activeConversation?.messages ?? []

  const updateConversation = useCallback((id, updater) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id ? updater(conversation) : conversation,
      ),
    )
  }, [])

  const startNewChat = useCallback(() => {
    const id = `c-${Date.now()}`
    setConversations((prev) => [
      {
        id,
        title: 'New conversation',
        group: 'Today',
        updatedAt: new Date().toISOString(),
        messages: [],
      },
      ...prev,
    ])
    setActiveId(id)
    setStatus('idle')
    setError(null)
  }, [])

  const selectConversation = useCallback((id) => {
    setActiveId(id)
    setStatus('idle')
    setError(null)
  }, [])

  const clearConversation = useCallback(() => {
    if (!activeId) return
    updateConversation(activeId, (conversation) => ({ ...conversation, messages: [] }))
    setStatus('idle')
    setError(null)
  }, [activeId, updateConversation])

  const runAssistantTurn = useCallback(
    async (conversationId, promptText, attachments, history = []) => {
      const requestId = ++requestRef.current
      setStatus('sending')
      setError(null)

      try {
        // Live backend when configured, mock demo replies otherwise.
        // Both resolve to the same assistant-message shape.
        const reply = isN8nConfigured()
          ? await n8nSend({
              text: promptText,
              attachments,
              conversationId,
              history,
            })
          : await mockSend({ text: promptText, attachments })
        if (requestRef.current !== requestId) return
        updateConversation(conversationId, (conversation) => ({
          ...conversation,
          messages: [...conversation.messages, reply],
          updatedAt: new Date().toISOString(),
        }))
        setStatus('idle')
      } catch (err) {
        if (requestRef.current !== requestId) return
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('error')
      }
    },
    [updateConversation],
  )

  const sendMessage = useCallback(
    ({ text, attachments = [] }) => {
      const trimmed = text.trim()
      if (!trimmed || !activeId || status === 'sending') return

      const userMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        createdAt: new Date().toISOString(),
        text: trimmed,
        attachments: attachments.map(({ name, size }) => ({ name, size })),
      }

      const conversation = conversations.find((c) => c.id === activeId)
      const history = toHistory(conversation?.messages ?? []).slice(-10)

      updateConversation(activeId, (conv) => ({
        ...conv,
        title: conv.messages.length === 0 ? trimmed.slice(0, 48) : conv.title,
        messages: [...conv.messages, userMessage],
        updatedAt: new Date().toISOString(),
      }))

      runAssistantTurn(activeId, trimmed, attachments, history)
    },
    [activeId, status, conversations, updateConversation, runAssistantTurn],
  )

  const regenerate = useCallback(() => {
    if (!activeId || status === 'sending') return

    const conversation = conversations.find((c) => c.id === activeId)
    if (!conversation) return

    const lastUserIndex = [...conversation.messages]
      .map((m) => m.role)
      .lastIndexOf('user')
    if (lastUserIndex === -1) return

    const promptText = conversation.messages[lastUserIndex].text
    const trimmedMessages = conversation.messages.slice(0, lastUserIndex + 1)
    const history = toHistory(conversation.messages.slice(0, lastUserIndex)).slice(-10)

    updateConversation(activeId, (c) => ({ ...c, messages: trimmedMessages }))
    runAssistantTurn(activeId, promptText, [], history)
  }, [activeId, status, conversations, updateConversation, runAssistantTurn])

  const retry = useCallback(() => {
    if (!activeId) return
    const conversation = conversations.find((c) => c.id === activeId)
    if (!conversation) return

    const lastUser = [...conversation.messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    const lastUserIndex = conversation.messages.lastIndexOf(lastUser)
    const history = toHistory(conversation.messages.slice(0, lastUserIndex)).slice(-10)
    runAssistantTurn(activeId, lastUser.text, lastUser.attachments ?? [], history)
  }, [activeId, conversations, runAssistantTurn])

  // Abandon in-flight responses when the user navigates away.
  useEffect(() => {
    return () => {
      requestRef.current += 1
    }
  }, [activeId])

  return {
    conversations,
    activeConversation,
    activeId,
    messages,
    status,
    error,
    sendMessage,
    regenerate,
    retry,
    startNewChat,
    selectConversation,
    clearConversation,
  }
}
