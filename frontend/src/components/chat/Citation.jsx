import { FileText } from 'lucide-react'

/**
 * Statutory references. Visually secondary by design — they support the
 * answer, they are not the answer. Non-functional in the prototype.
 */
export default function Citation({ items }) {
  return (
    <div className="flex items-start gap-2 pt-1 text-[12px] leading-relaxed text-ink-muted">
      <FileText
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-disabled"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <p>
        {items.map((item, index) => (
          <span key={item.label}>
            {index > 0 && (
              <span aria-hidden="true" className="mx-1 text-ink-disabled">
                ·
              </span>
            )}
            <span className="font-medium text-ink-secondary">{item.label}</span>
            {item.meta && <span className="text-ink-disabled"> — {item.meta}</span>}
          </span>
        ))}
      </p>
    </div>
  )
}
