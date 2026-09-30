import { RotateCcw, TriangleAlert } from 'lucide-react'
import { Button } from '../ui/primitives'

/**
 * Restrained failure state. Informative, not alarming — and it never
 * masquerades as a browser error.
 */
export default function ErrorState({ onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-card border border-warn/25 bg-warn/[0.07] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <TriangleAlert
          className="mt-0.5 h-4 w-4 shrink-0 text-warn"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <div>
          <p className="text-[13px] font-medium text-ink-primary">
            Something went wrong while generating the response.
          </p>
          <p className="mt-0.5 text-[12px] text-ink-muted">
            Your question has been kept. You can try again.
          </p>
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={onRetry}
        className="shrink-0 self-start sm:self-auto"
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
        Try again
      </Button>
    </div>
  )
}
