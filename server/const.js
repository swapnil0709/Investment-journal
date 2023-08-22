import {
  BSE_DATE,
  NSE_DATE,
  CURRENT_YEAR,
  getCurrentMonthAbbreviation,
} from './utils.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url))

export const BSE_DUMP_URL = `https://www.bseindia.com/download/BhavCopy/Equity/BSE_EQ_BHAVCOPY_${BSE_DATE}.ZIP`

export const NSE_DUMP_URL = `https://archives.nseindia.com/content/historical/EQUITIES/${CURRENT_YEAR}/${getCurrentMonthAbbreviation()}/cm${NSE_DATE}bhav.csv.zip`

export const BSE_DIR_PATH = join(__dirname, 'downloads', 'bse-dump')
export const NSE_DIR_PATH = join(__dirname, 'downloads', 'nse-dump')

export const BSE_FILE_PATH = join(
  __dirname,
  'downloads',
  'bse-dump',
  'bse-dump.csv'
)
export const NSE_FILE_PATH = join(
  __dirname,
  'downloads',
  'nse-dump',
  'nse-dump.csv'
)

export const BSE_FILE_NAME = 'bse-dump.csv'
export const NSE_FILE_NAME = 'nse-dump.csv'

// export const localFilePath = './downloadedFile.txt'
// console.log({ NSE_DUMP_URL, BSE_DUMP_URL })
