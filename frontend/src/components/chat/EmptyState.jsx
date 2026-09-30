import { MshauriMark } from '../ui/primitives'

/**
 * The empty state carries the product's identity without over-claiming.
 * No statement about rate currency, coverage or KRA affiliation.
 */
export default function EmptyState({ suggestions, onSelectSuggestion }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-5 py-10 text-center">
      <span
        aria-hidden="true"
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-[18px] border border-accent/20 bg-accent/[0.08] text-accent-hover"
      >
        <MshauriMark className="h-7 w-7" />
      </span>

      <h2 className="max-w-[22ch] text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary sm:text-[28px]">
        How can I help you with your tax questions today?
      </h2>

      <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-ink-muted">
        Ask about Kenyan PAYE, VAT, Turnover Tax, rental income, returns or filing. This
        is a frontend prototype — responses are demonstration content, not tax
        advice.
      </p>

      <ul className="mt-8 grid w-full max-w-[560px] grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              onClick={() => onSelectSuggestion(suggestion)}
              className="group flex h-full w-full items-center gap-2 rounded-card border border-white/[0.07] bg-white/[0.025] px-3.5 py-3 text-left text-[13px] leading-snug text-ink-secondary transition-colors duration-200 ease-smooth hover:border-accent/30 hover:bg-accent/[0.06] hover:text-ink-primary"
            >
              <span>{suggestion}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
