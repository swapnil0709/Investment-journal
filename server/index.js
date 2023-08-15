import { BSE_DUMP_URL, NSE_DUMP_URL } from './const.js'
import { generateExcel } from './excel/excel.js'
import {
  combineTransactions,
  generateStockObject,
  generateTotalObject,
} from './process.js'
import { addIdForEachRecord, downloadZipFile, readCSVFile } from './utils.js'

downloadZipFile(NSE_DUMP_URL, './downloads/nse-dump')
downloadZipFile(BSE_DUMP_URL, './downloads/bse-dump')

const main = async () => {
  const stocksArray = []
  // List of CSV file paths
  const csvFilePaths = [
    './downloads/tradebook-RC3216-EQ.csv',
    './downloads/nse-dump/nse-dump.csv',
    './downloads/bse-dump/bse-dump.csv',
  ]

  try {
    const promises = csvFilePaths.map(readCSVFile)
    const [tradebookData, nseData, bseData] = await Promise.all(promises)

    console.log('CSV file reading is complete.')

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

        const stockObject = generateStockObject(
          tradesForSymbolPerDay,
          nseData,
          bseData
        )
        stocksArray.push(stockObject)
      })
    })
  } catch (error) {
    console.error('An error occurred:', error)
  }
  const [resultArray, invalidsArray] = combineTransactions(stocksArray)
  const finalStocksData = addIdForEachRecord(resultArray)
  const finalInvalidsData = addIdForEachRecord(invalidsArray)
  const totalObject = generateTotalObject(resultArray)
  generateExcel(finalStocksData, finalInvalidsData, totalObject)
}

main()
