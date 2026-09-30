import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import TaxTable from './TaxTable'
import Citation from './Citation'
import { IconButton } from '../ui/primitives'
import { blocksToPlainText } from '../../lib/blocksToPlainText'

/**
 * Renders one block of the assistant's structured response.
 *
 * The block union is the contract between the data layer and this file:
 * adding a block type means adding a case here and nothing else.
 */
function Block({ block }) {
  switch (block.type) {
    case 'heading':
      return (
        <h3 className="pt-1 text-[15px] font-semibold leading-snug text-ink-primary">
          {block.text}
        </h3>
      )

    case 'paragraph':
      return <p className="text-[14px] leading-[1.7] text-ink-secondary">{block.text}</p>

    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag
          className={[
            'space-y-1.5 pl-5 text-[14px] leading-[1.7] text-ink-secondary',
            block.ordered ? 'list-decimal' : 'list-disc',
            'marker:text-ink-disabled',
          ].join(' ')}
        >
          {block.items.map((item, index) => (
            <li key={index} className="pl-0.5">
              {item}
            </li>
          ))}
        </Tag>
      )
    }

    case 'table':
      return (
        <TaxTable
          columns={block.columns}
          rows={block.rows}
          align={block.align}
          caption={block.caption}
        />
      )

    case 'callout': {
      const isWarning = block.tone === 'warning'
      return (
        <aside
          className={[
            'rounded-card border-l-2 px-4 py-3',
            isWarning ? 'border-l-warn bg-warn/[0.06]' : 'border-l-accent bg-accent/[0.06]',
          ].join(' ')}
        >
          {block.title && (
            <p
              className={[
                'mb-1 text-[13px] font-semibold',
                isWarning ? 'text-warn' : 'text-accent-hover',
              ].join(' ')}
            >
              {block.title}
            </p>
          )}
          <p className="text-[13.5px] leading-[1.65] text-ink-secondary">{block.text}</p>
        </aside>
      )
    }

    case 'citations':
      return <Citation items={block.items} />

    default:
      return null
  }
}

export default function AssistantMessage({ message, isLast, onRegenerate }) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(blocksToPlainText(message.blocks ?? []))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* Clipboard unavailable — silently ignore in the prototype. */
    }
  }

  return (
    <article className="group animate-rise" aria-label="Mshauri response">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[13px] font-medium text-ink-muted">Mshauri</span>
        {message.demo && (
          <span className="text-[11px] font-medium text-warn">Demonstration data</span>
        )}
      </div>

      <div className="glass-message space-y-4 rounded-card px-4 py-4 sm:px-5 sm:py-5">
        {(message.blocks ?? []).map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </div>

      <div className="mt-2 flex items-center gap-0.5 opacity-70 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        <IconButton label={copied ? 'Copied' : 'Copy response'} size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
          ) : (
            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
          )}
        </IconButton>

        {isLast && (
          <IconButton label="Regenerate response" size="sm" onClick={onRegenerate}>
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
          </IconButton>
        )}

        <IconButton
          label="Helpful"
          size="sm"
          aria-pressed={feedback === 'up'}
          onClick={() => setFeedback((v) => (v === 'up' ? null : 'up'))}
          className={feedback === 'up' ? 'text-accent' : ''}
        >
          <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.75} />
        </IconButton>

        <IconButton
          label="Not helpful"
          size="sm"
          aria-pressed={feedback === 'down'}
          onClick={() => setFeedback((v) => (v === 'down' ? null : 'down'))}
          className={feedback === 'down' ? 'text-warn' : ''}
        >
          <ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.75} />
        </IconButton>
      </div>
    </article>
  )
}
