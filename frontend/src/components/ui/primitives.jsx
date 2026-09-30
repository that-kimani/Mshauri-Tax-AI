/**
 * Small shared primitives. Deliberately few — only what is genuinely
 * reused across the shell, the chat and the composer.
 */
import { forwardRef } from 'react'

const VARIANTS = {
  primary:
    'bg-accent/15 text-accent-hover border border-accent/30 hover:bg-accent/25 hover:border-accent/45',
  ghost:
    'bg-transparent text-ink-secondary border border-transparent hover:bg-white/[0.06] hover:text-ink-primary',
  outline:
    'bg-white/[0.03] text-ink-secondary border border-white/10 hover:bg-white/[0.07] hover:text-ink-primary',
}

const SIZES = {
  sm: 'h-8 px-3 text-[12px] gap-1.5',
  md: 'h-10 px-4 text-[13px] gap-2',
}

export const Button = forwardRef(function Button(
  { variant = 'outline', size = 'md', className = '', children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={[
        'inline-flex select-none items-center justify-center rounded-control font-medium',
        'transition-colors duration-200 ease-smooth',
        'disabled:cursor-not-allowed disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
})

export const IconButton = forwardRef(function IconButton(
  { label, className = '', size = 'md', children, ...props },
  ref,
) {
  const dimension = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={[
        dimension,
        'inline-flex items-center justify-center rounded-[9px]',
        'text-ink-muted transition-colors duration-200 ease-smooth',
        'hover:bg-white/[0.07] hover:text-ink-primary',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
})

/** The Mshauri identity mark — an original two-peak contour. */
export function MshauriMark({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.2 18.2 9.4 7.6a1.25 1.25 0 0 1 2.16 0l2.02 3.5 1.5-2.6a1.25 1.25 0 0 1 2.16 0l3.56 6.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.6 18.2h6.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}

export function MshauriWordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-accent/25 bg-accent/10 text-accent-hover">
        <MshauriMark className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold leading-tight tracking-[-0.01em] text-ink-primary">
          Mshauri
        </span>
        <span className="block text-[11px] font-medium leading-tight text-ink-muted">
          Kenya Tax AI
        </span>
      </span>
    </div>
  )
}
