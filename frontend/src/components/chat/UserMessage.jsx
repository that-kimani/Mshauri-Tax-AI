import { Paperclip } from 'lucide-react'

function formatBytes(bytes) {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB']
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  )
  const value = bytes / 1024 ** exponent
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

export default function UserMessage({ message }) {
  return (
    <div className="flex animate-rise justify-end">
      <div className="flex max-w-[85%] flex-col items-end gap-2 sm:max-w-[78%]">
        <div className="glass-user-message rounded-card px-4 py-3">
          <p className="whitespace-pre-wrap text-[14px] leading-[1.65] text-ink-primary">
            {message.text}
          </p>
        </div>

        {message.attachments?.length > 0 && (
          <ul className="flex flex-wrap justify-end gap-1.5">
            {message.attachments.map((file) => (
              <li
                key={file.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-ink-muted"
              >
                <Paperclip
                  className="h-3 w-3 shrink-0"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="max-w-[160px] truncate">{file.name}</span>
                {file.size > 0 && (
                  <span className="text-ink-disabled">{formatBytes(file.size)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
