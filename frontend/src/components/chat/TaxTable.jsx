/**
 * Semantic table for tax figures.
 *
 * Rules:
 *  - real <table> markup so screen readers and browser find-in-page work
 *  - numeric columns are monospaced and right-aligned for scanning
 *  - horizontal scroll on narrow viewports instead of crushing columns
 */
import { renderRichText } from '../../lib/richText'

export default function TaxTable({ columns, rows, align = [], caption }) {
  return (
    <figure className="my-1">
      <div className="-mx-1 overflow-x-auto rounded-card border border-white/[0.07] bg-black/20">
        <table className="w-full min-w-[420px] border-collapse text-left">
          {caption && (
            <caption className="px-4 pt-3 text-left text-[11px] font-medium text-ink-disabled">
              {caption}
            </caption>
          )}
          <thead>
            <tr className="border-b border-white/[0.08]">
              {columns.map((column, index) => (
                <th
                  key={column}
                  scope="col"
                  className={[
                    'whitespace-nowrap px-4 py-2.5 text-[12px] font-medium text-ink-muted',
                    align[index] === 'num' ? 'text-right' : 'text-left',
                  ].join(' ')}
                >
                  {renderRichText(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-white/[0.05] last:border-b-0 transition-colors duration-150 hover:bg-white/[0.025]"
              >
                {row.map((cell, cellIndex) => {
                  const isNumeric = align[cellIndex] === 'num'
                  return (
                    <td
                      key={cellIndex}
                      className={[
                        'px-4 py-2.5 text-[13px] leading-relaxed',
                        isNumeric
                          ? 'tabular whitespace-nowrap text-right font-medium text-ink-primary'
                          : 'text-ink-secondary',
                        cellIndex === 0 && !isNumeric
                          ? 'font-medium text-ink-primary'
                          : '',
                      ].join(' ')}
                    >
                      {renderRichText(cell)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
