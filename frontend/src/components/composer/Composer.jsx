import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2, Paperclip, X } from 'lucide-react'

const MAX_TEXTAREA_HEIGHT = 168 // ~6 lines at the current line-height

/**
 * The composer is the primary interaction surface, so it carries the
 * strongest glass treatment in the product.
 *
 * It performs no tax logic and no document analysis. Attachments are
 * selected locally and cleared on send — the wiring point for real
 * document processing is `onSend({ text, attachments })`.
 */
export default function Composer({ onSend, status, draft, onDraftChange }) {
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const [attachments, setAttachments] = useState([])

  const isSending = status === 'sending'
  const canSend = draft.trim().length > 0 && !isSending

  const resize = useCallback(() => {
    const element = textareaRef.current
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [])

  useEffect(() => {
    resize()
  }, [draft, resize])

  const submit = () => {
    if (!canSend) return
    onSend({ text: draft, attachments })
    onDraftChange('')
    setAttachments([])
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  const handleFiles = (event) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    setAttachments((prev) => [
      ...prev,
      ...files.map((file) => ({ name: file.name, size: file.size })),
    ])
    event.target.value = ''
  }

  return (
    <div className="shrink-0 px-4 pb-4 pt-1 safe-bottom sm:px-6 sm:pb-6">
      <div className="mx-auto w-full max-w-conversation">
        {attachments.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] py-1 pl-2.5 pr-1.5 text-[11px] text-ink-secondary"
              >
                <Paperclip
                  className="h-3 w-3 shrink-0 text-ink-disabled"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="max-w-[180px] truncate">{file.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-ink-disabled transition-colors hover:bg-white/10 hover:text-ink-secondary"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="glass-composer rounded-card transition-colors duration-200 ease-smooth focus-within:border-accent/35">
          <label htmlFor="mshauri-composer" className="sr-only">
            Ask Mshauri a tax question
          </label>

          <textarea
            id="mshauri-composer"
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Mshauri a tax question."
            className="block max-h-[168px] w-full resize-none bg-transparent px-4 pt-3.5 text-[14px] leading-[1.6] text-ink-primary placeholder:text-ink-disabled focus:outline-none sm:px-5"
          />

          <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5 pt-1.5 sm:px-3">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach a document"
                title="Attach a document"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] text-ink-muted transition-colors duration-200 hover:bg-white/[0.07] hover:text-ink-primary"
              >
                <Paperclip className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFiles}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
              />
              <span className="ml-1 hidden text-[11px] text-ink-disabled sm:inline">
                Documents are not analysed in this prototype
              </span>
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label={isSending ? 'Sending' : 'Send message'}
              className={[
                'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
                'transition-all duration-200 ease-smooth',
                canSend
                  ? 'bg-accent text-[#06090F] hover:bg-accent-hover'
                  : 'cursor-not-allowed bg-white/[0.06] text-ink-disabled',
              ].join(' ')}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
              )}
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] leading-relaxed text-ink-disabled">
          Mshauri is a frontend prototype. Responses are demonstration content and are not
          tax advice.
        </p>
      </div>
    </div>
  )
}
