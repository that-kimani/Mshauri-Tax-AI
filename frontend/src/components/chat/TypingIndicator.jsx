export default function TypingIndicator() {
  return (
    <div className="animate-rise" role="status" aria-live="polite">
      <span className="sr-only">Mshauri is composing a response</span>
      <span className="text-[12px] text-ink-muted">
        Mshauri is composing a response…
      </span>
    </div>
  )
}
