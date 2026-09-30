/**
 * Mock conversation data.
 *
 * IMPORTANT — read before editing.
 * ------------------------------------------------------------------
 * This file is PRESENTATION DATA. Nothing here is computed by the
 * frontend, and nothing here should be read as a statement of current
 * Kenyan tax law. The monetary values are fabricated demonstration
 * figures used to exercise the structured-response renderer (tables,
 * callouts, citations). When the real Mshauri API is connected, this
 * module is deleted and the same message shape is returned by the
 * service layer instead.
 *
 * Message shape (the contract the renderer depends on):
 *
 *   {
 *     id: string,
 *     role: 'user' | 'assistant',
 *     createdAt: string (ISO),
 *     demo?: boolean,              // renders a "Demonstration data" badge
 *     text?: string,               // user messages
 *     attachments?: { name, size }[],
 *     blocks?: Block[]             // assistant messages
 *   }
 *
 * Block union:
 *   { type: 'paragraph', text }
 *   { type: 'heading', text }
 *   { type: 'list', ordered?, items: string[] }
 *   { type: 'table', columns: string[], align?: ('text'|'num')[], rows: string[][], caption? }
 *   { type: 'callout', tone: 'accent'|'warning', title?, text }
 *   { type: 'citations', items: { label, meta }[] }
 */

export const DEMO_CONVERSATION_ID = 'demo-paye'

const demoPayeResponse = {
  id: 'm-demo-1',
  role: 'assistant',
  createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  demo: true,
  blocks: [
    {
      type: 'paragraph',
      text: 'A Kenyan payslip usually has three layers: gross pay, the statutory deductions taken from it, and PAYE on the taxable remainder. Below is an illustration of how those layers are typically presented.',
    },
    {
      type: 'heading',
      text: 'The moving parts',
    },
    {
      type: 'list',
      ordered: false,
      items: [
        'Gross pay — salary plus any taxable allowances before deductions.',
        'PAYE — pay-as-you-earn income tax, withheld by the employer and remitted on the employee’s behalf.',
        'NSSF — a pension contribution, split between employee and employer.',
        'SHIF — the social health contribution that replaced the previous NHIF arrangement.',
        'Housing Levy — an employee and employer contribution tied to the national housing programme.',
      ],
    },
    {
      type: 'heading',
      text: 'Illustrative breakdown',
    },
    {
      type: 'paragraph',
      text: 'The figures below are demonstration values for a fictional salary. They are not calculated by this interface and must not be relied on for filing.',
    },
    {
      type: 'table',
      caption: 'Demonstration payslip — fictional salary, not a calculation',
      columns: ['Component', 'Amount (KES)', 'Basis'],
      align: ['text', 'num', 'text'],
      rows: [
        ['Gross monthly pay', '120,000', 'Demonstration figure'],
        ['PAYE', '18,400', 'Demonstration figure'],
        ['NSSF', '2,160', 'Demonstration figure'],
        ['SHIF', '3,300', 'Demonstration figure'],
        ['Housing Levy', '1,800', 'Demonstration figure'],
        ['Net pay', '94,340', 'Demonstration figure'],
      ],
    },
    {
      type: 'heading',
      text: 'How to read it',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Start from gross pay — that is the number your employer commits to.',
        'Deduct the statutory contributions first; they reduce the amount PAYE is charged on.',
        'Apply PAYE to what remains.',
        'The balance is what actually reaches your bank account.',
      ],
    },
    {
      type: 'callout',
      tone: 'accent',
      title: 'Summary',
      text: 'In the live product, this is where Mshauri would show your final net figure alongside the exact rates applied and the effective date of those rates — sourced from the Mshauri tax service, not from the interface.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Before you rely on any figure',
      text: 'Rates, bands and reliefs change. Treat any number here as a worked example and confirm the current position with the Mshauri service or KRA before filing.',
    },
    {
      type: 'citations',
      items: [
        { label: 'Income Tax Act', meta: 'PAYE framework' },
        { label: 'Tax Procedures Act', meta: 'Filing and assessment' },
        { label: 'Finance Act', meta: 'Annual rate changes' },
      ],
    },
  ],
}

export const MOCK_CONVERSATIONS = [
  {
    id: DEMO_CONVERSATION_ID,
    title: 'PAYE and statutory deductions',
    group: 'Today',
    updatedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    messages: [
      {
        id: 'u-demo-1',
        role: 'user',
        createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
        text: 'Can you explain how PAYE and the other statutory deductions affect a monthly salary in Kenya?',
      },
      demoPayeResponse,
    ],
  },
  {
    id: 'c-2',
    title: 'Penalties for late filing',
    group: 'Today',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    messages: [],
  },
  {
    id: 'c-3',
    title: 'Rental income — what is taxable',
    group: 'Today',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    messages: [],
  },
  {
    id: 'c-4',
    title: 'VAT registration threshold',
    group: 'Previous 7 Days',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    messages: [],
  },
  {
    id: 'c-5',
    title: 'Turnover Tax basics',
    group: 'Previous 7 Days',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 49).toISOString(),
    messages: [],
  },
  {
    id: 'c-6',
    title: 'Instalment tax for companies',
    group: 'Previous 7 Days',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    messages: [],
  },
]

export const PROMPT_SUGGESTIONS = [
  'Explain how PAYE is structured on a monthly payslip',
  'What does Turnover Tax apply to?',
  'What happens if a return is filed late?',
  'How is rental income treated for tax?',
]
