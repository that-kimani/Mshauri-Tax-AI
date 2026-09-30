import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import Sidebar from './Sidebar'

/**
 * Mobile / tablet navigation drawer.
 *
 * Rendered as a LEFT overlay panel per the implementation overrides —
 * not a bottom sheet. Content is mounted only while open so the sidebar
 * is not duplicated in the accessibility tree.
 */
export default function MobileDrawer({ open, onClose, ...sidebarProps }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    // Restore focus to whatever opened the drawer, so keyboard and screen
    // reader users are not dropped back at the top of the document.
    const previouslyFocused = document.activeElement

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
    >
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 animate-fade-in"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="glass-float absolute inset-y-0 left-0 flex w-[280px] max-w-[86vw] flex-col rounded-r-panel outline-none animate-drawer-in"
      >
        <div className="absolute right-2 top-2 z-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] text-ink-muted transition-colors duration-200 hover:bg-white/[0.07] hover:text-ink-primary"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <Sidebar {...sidebarProps} onNavigate={onClose} className="w-full" />
      </div>
    </div>
  )
}
