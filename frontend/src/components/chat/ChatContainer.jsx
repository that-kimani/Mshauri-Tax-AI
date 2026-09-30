import { useEffect, useRef } from 'react'
import EmptyState from './EmptyState'
import UserMessage from './UserMessage'
import AssistantMessage from './AssistantMessage'
import TypingIndicator from './TypingIndicator'
import ErrorState from './ErrorState'
import { PROMPT_SUGGESTIONS } from '../../data/mockConversations'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

/**
 * Owns the scroll behaviour for the conversation.
 *
 * Auto-scroll only while the user is already pinned to the bottom. The
 * moment they scroll up to re-read something, the stream stops moving.
 */
export default function ChatContainer({
  messages,
  status,
  onSend,
  onRegenerate,
  onRetry,
}) {
  const scrollRef = useRef(null)
  const pinnedRef = useRef(true)
  const prefersReducedMotion = usePrefersReducedMotion()

  const handleScroll = () => {
    const element = scrollRef.current
    if (!element) return
    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight
    pinnedRef.current = distanceFromBottom < 96
  }

  useEffect(() => {
    const element = scrollRef.current
    if (!element || !pinnedRef.current) return
    element.scrollTo({
      top: element.scrollHeight,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [messages.length, status, prefersReducedMotion])

  const isEmpty = messages.length === 0
  const lastAssistantIndex = messages.map((m) => m.role).lastIndexOf('assistant')

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
    >
      <div className="mx-auto w-full max-w-conversation px-4 pb-6 sm:px-6">
        {isEmpty && status !== 'sending' ? (
          <EmptyState suggestions={PROMPT_SUGGESTIONS} onSelectSuggestion={onSend} />
        ) : (
          <div className="space-y-6 pt-6">
            {messages.map((message, index) =>
              message.role === 'user' ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage
                  key={message.id}
                  message={message}
                  isLast={index === lastAssistantIndex}
                  onRegenerate={onRegenerate}
                />
              ),
            )}

            {status === 'sending' && (
              <div className="pl-1">
                <TypingIndicator />
              </div>
            )}

            {status === 'error' && <ErrorState onRetry={onRetry} />}
          </div>
        )}
      </div>
    </div>
  )
}
