// Configs
export const ROW_HEIGHT = 25

// Colors
export const CHARGES_COLOR = 'fcbf49'
export const HEADERS_COLOR = '92D050'
export const HYPERLINK_COLOR = '5a189a'
export const TEXT_COLOR = '14213d'
export const TOTALS_COLOR = '003566'
export const WHITE_TEXT_COLOR = 'ffffff'
export const TEXT_RED_COLOR = 'FFFF0000'

// Path
export const OUTPUT_PATH = './output/investment_journal_v1.0.xlsx'

// Data
export const COLUMNS = [
  { header: 'SNo.', key: 'id', width: 5 },
  { header: 'Symbol', key: 'Symbol', width: 15 },
  { header: 'Qty', key: 'Qty', width: 10 },
  { header: 'Chart', key: 'Chart Link', width: 10 },
  { header: 'First Buy Date', key: 'First Buy Date', width: 15 },
  { header: 'Latest Buy Date', key: 'Latest Buy Date', width: 15 },
  { header: 'First Buy Price', key: 'First Buy Price', width: 10 },
  { header: 'Buy Price', key: 'Buy Price', width: 10 },
  { header: 'LTP', key: 'LTP', width: 10 },
  { header: 'Exchange', key: 'Exchange', width: 5 },
  { header: 'Type', key: 'Trade Type', width: 5 },
  { header: 'Invested Amount', key: 'Invested Amount', width: 15 },
  { header: 'Sell Price', key: 'Sell Price', width: 10 },
  { header: 'Sell date', key: 'Sell date', width: 15 },
  { header: 'Realized Gain', key: 'Realized Gain', width: 10 },
  { header: 'Unrealized Gain', key: 'Unrealized Gain', width: 10 },
  { header: 'Realized Gain %', key: 'Realized Gain %', width: 10 },
  { header: 'Unrealized Gain %', key: 'Unrealized Gain %', width: 10 },
  { header: 'SL', key: 'SL', width: 10 },
  { header: 'SL %', key: 'SL %', width: 10 },
  { header: 'Loss at SL', key: 'Loss at SL', width: 10 },
  { header: 'Charges (Ch.)', key: 'Brokerage', width: 10 },
  { header: 'Charges (Ch.)', key: 'STT', width: 10 },
  { header: 'Charges (Ch.)', key: 'Exchange Charges', width: 10 },
  { header: 'Charges (Ch.)', key: 'SEBI Charge', width: 10 },
  { header: 'Charges (Ch.)', key: 'Stamp charges', width: 10 },
  { header: 'Charges (Ch.)', key: 'GST', width: 10 },
  { header: 'Charges (Ch.)', key: 'Income Tax', width: 10 },
  { header: 'Net Real. Gain', key: 'Net Realized Gain', width: 10 },
  { header: 'Net Real. %', key: 'Net Realized %', width: 10 },
]

export const MERGE_CELLS_DATA = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'AC',
  'AD',
]

export const SUB_HEADERS_DATA = [
  { cell: 'V', label: 'Broker' },
  { cell: 'W', label: 'STT' },
  { cell: 'X', label: 'Exc. Ch.' },
  { cell: 'Y', label: 'SEBI Ch.' },
  { cell: 'Z', label: 'Stamp Ch.' },
  { cell: 'AA', label: 'GST' },
  { cell: 'AB', label: 'Income Tax' },
]

export const METRICS_REALIZED_HEADERS = [
  { label: 'Analysis of realised profits' },
  { label: 'Realized profits' },
  { label: 'Capital on which profits have been realized' },
  { label: 'Realized profit %' },
  { label: 'No. of trades completed' },
  { label: 'Profitable %' },
  { label: 'Loss %' },
  { label: 'Average gain' },
  { label: 'Average loss' },
  { label: 'Gain:Loss' },
  { label: 'Multiple ratio' },
]
