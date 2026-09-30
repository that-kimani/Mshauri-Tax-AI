import { useState } from 'react'
import MobileDrawer from './components/layout/MobileDrawer'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import ChatContainer from './components/chat/ChatContainer'
import Composer from './components/composer/Composer'
import { useChat } from './hooks/useChat'

export default function App() {
  const {
    conversations,
    activeConversation,
    activeId,
    messages,
    status,
    sendMessage,
    regenerate,
    retry,
    startNewChat,
    selectConversation,
    clearConversation,
  } = useChat()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draft, setDraft] = useState('')

  const handleSend = (payload) => {
    if (typeof payload === 'string') {
      sendMessage({ text: payload })
      return
    }
    sendMessage(payload)
  }

  const sidebarProps = {
    conversations,
    activeId,
    onSelect: selectConversation,
    onNewChat: startNewChat,
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/* Layer 0 + 1 — atmosphere and readability protection */}
      <div className="mshauri-atmosphere" aria-hidden="true" />

      {/* Layer 2 — floating application shell */}
      <div className="relative z-10 flex h-full w-full p-2.5 sm:p-3 lg:p-4">
        <div className="glass-shell flex h-full w-full overflow-hidden rounded-shell">
          <Sidebar
            {...sidebarProps}
            className="hidden w-[272px] shrink-0 lg:flex"
          />

          <main className="flex min-w-0 flex-1 flex-col">
            <Header
              title={activeConversation?.title}
              onOpenNav={() => setDrawerOpen(true)}
              onClear={clearConversation}
              canClear={messages.length > 0}
            />

            <ChatContainer
              messages={messages}
              status={status}
              onSend={handleSend}
              onRegenerate={regenerate}
              onRetry={retry}
            />

            <Composer
              onSend={handleSend}
              status={status}
              draft={draft}
              onDraftChange={setDraft}
            />
          </main>
        </div>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        {...sidebarProps}
      />
    </div>
  )
}
