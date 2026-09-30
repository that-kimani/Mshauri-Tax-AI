import { Menu, Share2, Trash2 } from 'lucide-react'
import { IconButton } from '../ui/primitives'

/**
 * Deliberately quiet. The header orients the user; it does not compete
 * with the conversation. No status claims about KRA, rates or coverage.
 */
export default function Header({ title, onOpenNav, onClear, canClear }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.05] px-3 sm:px-5">
      <IconButton label="Open navigation" onClick={onOpenNav} className="lg:hidden">
        <Menu className="h-4 w-4" strokeWidth={1.75} />
      </IconButton>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[14px] font-semibold tracking-[-0.005em] text-ink-primary">
          {title || 'New conversation'}
        </h1>
      </div>

      <span className="hidden text-[12px] font-medium text-ink-muted sm:inline">
        Mshauri Tax Advisor
      </span>

      <div className="flex items-center gap-0.5">
        <IconButton label="Share conversation (prototype)" disabled>
          <Share2 className="h-4 w-4" strokeWidth={1.75} />
        </IconButton>
        <IconButton label="Clear conversation" onClick={onClear} disabled={!canClear}>
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </IconButton>
      </div>
    </header>
  )
}
