import { useEffect, useRef, useState } from 'react'
import { MessageSquarePlus, Search, Settings, X } from 'lucide-react'
import { MshauriWordmark } from '../ui/primitives'

const GROUP_ORDER = ['Today', 'Previous 7 Days']

function groupConversations(conversations) {
  const groups = new Map()
  for (const conversation of conversations) {
    const key = conversation.group ?? 'Earlier'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(conversation)
  }
  return [...groups.entries()].sort(
    (a, b) =>
      (GROUP_ORDER.indexOf(a[0]) + 1 || 99) - (GROUP_ORDER.indexOf(b[0]) + 1 || 99),
  )
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onNavigate,
  className = '',
}) {
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  const filtered = query.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : conversations

  const groups = groupConversations(filtered)

  // Cmd/Ctrl+K focuses search — a small, expected affordance.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div
      className={[
        // No width here on purpose — the caller owns it. A hardcoded
        // `w-full` would collide with the width passed via `className`
        // and win on stylesheet order, collapsing the main canvas.
        'glass-sidebar flex h-full min-w-0 flex-col border-r border-white/[0.05]',
        className,
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center px-4">
        <MshauriWordmark />
      </div>

      {/* New chat */}
      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={() => {
            onNewChat()
            onNavigate?.()
          }}
          className="group flex h-10 w-full items-center justify-center gap-2.5 rounded-full border border-accent/25 bg-accent/10 px-3 text-[13px] font-medium text-accent-hover transition-colors duration-200 ease-smooth hover:border-accent/40 hover:bg-accent/20"
        >
          <MessageSquarePlus className="h-4 w-4" strokeWidth={1.75} />
          New chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="group flex h-9 items-center gap-2 rounded-control border border-white/[0.06] bg-white/[0.03] px-2.5 transition-colors duration-200 ease-smooth focus-within:border-accent/40 focus-within:bg-white/[0.05]">
          <Search className="h-3.5 w-3.5 shrink-0 text-ink-disabled" strokeWidth={1.75} />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-ink-primary placeholder:text-ink-disabled focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="shrink-0 rounded p-0.5 text-ink-disabled transition-colors hover:text-ink-secondary"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* History */}
      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-3"
        aria-label="Conversation history"
      >
        {groups.length === 0 && (
          <p className="px-2 py-6 text-[12px] text-ink-disabled">
            No conversations match “{query}”.
          </p>
        )}

        {groups.map(([group, items]) => (
          <div key={group} className="mb-4 last:mb-0">
            <h2 className="px-2 pb-1.5 text-[12px] font-medium text-ink-disabled">
              {group}
            </h2>
            <ul className="space-y-0.5">
              {items.map((conversation) => {
                const isActive = conversation.id === activeId
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(conversation.id)
                        onNavigate?.()
                      }}
                      aria-current={isActive ? 'true' : undefined}
                      className={[
                        'group relative flex w-full items-center rounded-[9px] py-2 pl-3 pr-2.5 text-left',
                        'text-[13px] leading-snug transition-colors duration-200 ease-smooth',
                        isActive
                          ? 'bg-white/[0.07] text-ink-primary'
                          : 'text-ink-muted hover:bg-white/[0.045] hover:text-ink-secondary',
                      ].join(' ')}
                    >
                      <span
                        aria-hidden="true"
                        className={[
                          'absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full transition-opacity duration-200',
                          isActive ? 'bg-accent opacity-100' : 'opacity-0',
                        ].join(' ')}
                      />
                      <span className="truncate">{conversation.title}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/[0.05] p-3">
        <div className="flex items-center gap-2.5 rounded-control px-2 py-1.5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[11px] font-semibold text-ink-secondary"
          >
            GU
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-ink-secondary">
              Guest User
            </span>
            <span className="block truncate text-[11px] text-ink-disabled">
              Prototype session
            </span>
          </span>
          <button
            type="button"
            aria-label="Settings"
            title="Settings"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-ink-disabled transition-colors duration-200 hover:bg-white/[0.06] hover:text-ink-secondary"
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  )
}
