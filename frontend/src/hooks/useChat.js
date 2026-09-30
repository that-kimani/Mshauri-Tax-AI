import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MOCK_CONVERSATIONS, DEMO_CONVERSATION_ID } from '../data/mockConversations'
import { sendMessage as mockSend } from '../lib/mockService'

/**
 * Owns all conversation state.
 *
 * The component tree never talks to the data source directly — it calls
 * `sendMessage`, `selectConversation`, `startNewChat`, etc. When the real
 * Mshauri API lands, only this hook and `lib/mockService` change.
 */
export function useChat() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS)
  const [activeId, setActiveId] = useState(DEMO_CONVERSATION_ID)
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
    async (conversationId, promptText, attachments) => {
      const requestId = ++requestRef.current
      setStatus('sending')
      setError(null)

      try {
        const reply = await mockSend({ text: promptText, attachments })
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

      updateConversation(activeId, (conversation) => ({
        ...conversation,
        title: conversation.messages.length === 0 ? trimmed.slice(0, 48) : conversation.title,
        messages: [...conversation.messages, userMessage],
        updatedAt: new Date().toISOString(),
      }))

      runAssistantTurn(activeId, trimmed, attachments)
    },
    [activeId, status, updateConversation, runAssistantTurn],
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

    updateConversation(activeId, (c) => ({ ...c, messages: trimmedMessages }))
    runAssistantTurn(activeId, promptText, [])
  }, [activeId, status, conversations, updateConversation, runAssistantTurn])

  const retry = useCallback(() => {
    if (!activeId) return
    const conversation = conversations.find((c) => c.id === activeId)
    if (!conversation) return

    const lastUser = [...conversation.messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    runAssistantTurn(activeId, lastUser.text, lastUser.attachments ?? [])
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
