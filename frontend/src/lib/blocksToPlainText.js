/**
 * Flattens structured assistant blocks into plain text for the copy action.
 * Kept separate from the renderer so both stay simple.
 */
export function blocksToPlainText(blocks = []) {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading':
        case 'paragraph':
          return block.text

        case 'list':
          return block.items
            .map((item, index) => (block.ordered ? `${index + 1}. ${item}` : `• ${item}`))
            .join('\n')

        case 'table': {
          const header = block.columns.join(' | ')
          const divider = block.columns.map(() => '---').join(' | ')
          const body = block.rows.map((row) => row.join(' | ')).join('\n')
          return [header, divider, body].join('\n')
        }

        case 'callout':
          return [block.title, block.text].filter(Boolean).join(': ')

        case 'citations':
          return block.items.map((item) => item.label).join(', ')

        default:
          return ''
      }
    })
    .filter(Boolean)
    .join('\n\n')
}
