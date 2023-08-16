import {
  BSE_DATE,
  NSE_DATE,
  CURRENT_YEAR,
  getCurrentMonthAbbreviation,
} from './utils.js'

export const BSE_DUMP_URL = `https://www.bseindia.com/download/BhavCopy/Equity/BSE_EQ_BHAVCOPY_14082023.ZIP`

export const NSE_DUMP_URL = `https://archives.nseindia.com/content/historical/EQUITIES/${CURRENT_YEAR}/${getCurrentMonthAbbreviation()}/cm14AUG2023bhav.csv.zip`

export const BSE_DIR_PATH = `./downloads/bse-dump/`
export const NSE_DIR_PATH = `./downloads/nse-dump/`

export const BSE_FILE_PATH = `./downloads/bse-dump/bse-dump.csv`
export const NSE_FILE_PATH = `./downloads/nse-dump/nse-dump.csv`

// export const localFilePath = './downloadedFile.txt'
// console.log({ NSE_DUMP_URL, BSE_DUMP_URL })
