import {
  BSE_DATE,
  NSE_DATE,
  CURRENT_YEAR,
  getCurrentMonthAbbreviation,
} from './utils.js'

export const BSE_DUMP_URL = `https://www.bseindia.com/download/BhavCopy/Equity/BSE_EQ_BHAVCOPY_${BSE_DATE}.ZIP`

export const NSE_DUMP_URL = `https://archives.nseindia.com/content/historical/EQUITIES/${CURRENT_YEAR}/${getCurrentMonthAbbreviation()}/cm${NSE_DATE}bhav.csv.zip`

// export const localFilePath = './downloadedFile.txt'
// console.log({ NSE_DUMP_URL, BSE_DUMP_URL })
