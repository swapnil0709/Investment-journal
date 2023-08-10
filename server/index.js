import { BSE_DUMP_URL, NSE_DUMP_URL } from './const.js'
import { generateStockObject } from './process.js'
import {
  downloadZipFile,
  readCSVFile,
  getSum,
  getAvg,
  generateExcel,
  generateNewExcel,
} from './utils.js'

downloadZipFile(NSE_DUMP_URL, './downloads/nse-dump')
downloadZipFile(BSE_DUMP_URL, './downloads/bse-dump')
let count = 0
const main = async () => {
  const buyArray = []
  const sellArray = []
  // List of CSV file paths
  const csvFilePaths = [
    './downloads/tradebook-RC3216-EQ.csv',
    './downloads/nse-dump/cm09AUG2023bhav.csv',
    './downloads/bse-dump/BSE_EQ_BHAVCOPY_09082023.csv',
  ]

  try {
    const promises = csvFilePaths.map(readCSVFile)
    const [tradebookData, nseData, bseData] = await Promise.all(promises)

    console.log('CSV file reading is complete.')
    // console.log({
    //   tradebookData: tradebookData.slice(0, 2),
    //   nseData: nseData.slice(0, 2),
    //   bseData: bseData.slice(0, 2),
    // })
    const datesArray = tradebookData.map(({ trade_date }) => trade_date)
    const uniqueDatesArray = [...new Set(datesArray)]
    uniqueDatesArray.forEach((eachUniqueDate, idx) => {
      const tradesPerDay = tradebookData.filter(
        ({ trade_date }) => trade_date === eachUniqueDate
      )
      const uniqueSymbolsArray = [
        ...new Set(tradesPerDay.map(({ symbol }) => symbol)),
      ]

      uniqueSymbolsArray.forEach((eachSymbol, index) => {
        const tradesForSymbolPerDay = tradesPerDay.filter(
          ({ symbol }) => symbol === eachSymbol
        )
        count++
        const stockObject = generateStockObject(
          tradesForSymbolPerDay,
          nseData,
          bseData,
          count
        )
        if (stockObject['Trade Type'] === 'buy') {
          buyArray.push(stockObject)
        } else {
          sellArray.push(stockObject)
        }
      })
    })
  } catch (error) {
    console.error('An error occurred:', error)
  }
  // console.log({ buyArray, sellArray })
  generateNewExcel([{}, ...buyArray, ...sellArray])
}

// main()
