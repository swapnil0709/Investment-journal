import csvParser from 'csv-parser'
import { NSE_FILE_NAME, BSE_FILE_NAME } from '../const.js'
import { generateExcel } from '../excel/excel.js'

import {
  generateStockObject,
  combineTransactions,
  generateTotalObject,
} from '../process.js'
import {
  addIdForEachRecord,
  readCsvDataFromDatabase,
  sortArrayByDate,
} from '../utils.js'

export const getApp = (req, res) => {
  res.send('Hello, from server!')
}

export const uploadAndDownload = async (req, res) => {
  const uploadedFile = await req.file

  if (!uploadedFile) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const excelWorkbook = new Promise((resolve, reject) => {
    const csvData = []

    uploadedFile
      .pipe(csvParser())
      .on('data', (row) => {
        csvData.push(row)
      })
      .on('end', async () => {
        const workbook = await generateExcelWorkbook(csvData)
        resolve(workbook)
      })
      .on('error', (error) => {
        reject(error)
      })
  })

  excelWorkbook
    .then((workbook) => {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      res.setHeader('Content-Disposition', 'attachment; filename=export.xlsx')
      workbook.xlsx.write(res).then(() => {
        res.end()
      })
    })
    .catch((error) => {
      console.error('Error generating Excel workbook:', error)
      res.status(500).json({ error: 'Error generating Excel workbook' })
    })
}

export const generateExcelWorkbook = async (tradebookData) => {
  const stocksArray = []

  try {
    const nseData = await readCsvDataFromDatabase(NSE_FILE_NAME)
    const bseData = await readCsvDataFromDatabase(BSE_FILE_NAME)

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
        const someBuyTransactionExists = tradesForSymbolPerDay.some(
          ({ trade_type }) => trade_type === 'buy'
        )
        const someSellTransactionExists = tradesForSymbolPerDay.some(
          ({ trade_type }) => trade_type === 'sell'
        )
        // Handle buy-sell transaction for a stock in same day:

        if (someBuyTransactionExists && someSellTransactionExists) {
          const filterBuyTransaction = tradesForSymbolPerDay.filter(
            ({ trade_type }) => trade_type === 'buy'
          )
          const filterSellTransaction = tradesForSymbolPerDay.filter(
            ({ trade_type }) => trade_type === 'sell'
          )
          const arrayOfArrays = [filterBuyTransaction, filterSellTransaction]

          for (const eachTransaction of arrayOfArrays) {
            const stockObject = generateStockObject(
              eachTransaction,
              nseData,
              bseData
            )
            stocksArray.push(stockObject)
          }
        } else {
          const stockObject = generateStockObject(
            tradesForSymbolPerDay,
            nseData,
            bseData
          )
          stocksArray.push(stockObject)
        }
      })
    })
  } catch (error) {
    console.error('An error occurred:', error)
  }
  const [resultArray, invalidsArray] = combineTransactions(stocksArray)
  const finalStocksData = addIdForEachRecord(
    sortArrayByDate(resultArray, 'Latest Buy Date')
  )
  const finalInvalidsData = addIdForEachRecord(invalidsArray)
  const totalObject = generateTotalObject(resultArray)
  return generateExcel(finalStocksData, finalInvalidsData, totalObject)
}
