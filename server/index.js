import { BSE_DUMP_URL, NSE_DUMP_URL } from './const.js'
import { generateExcel } from './excel/excel.js'
import {
  combineTransactions,
  generateStockObject,
  generateTotalObject,
} from './process.js'
import {
  addIdForEachRecord,
  downloadZipFile,
  logToFile,
  readCSVFile,
} from './utils.js'
import express from 'express'
import cron from 'node-cron'
import multer from 'multer'
import csvParser from 'csv-parser'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import cors from 'cors'

const app = express()
const PORT = 8001

// Use the cors middleware to allow requests from the React frontend
app.use(
  cors({
    origin: ['https://investment-journal.vercel.app'],
    methods: ['POST', 'GET'],
    credentials: true,
  })
)

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url))

// Schedule cron jobs

cron.schedule('0 20 * * * ', () => {
  console.log(`cron ran successfully at 8pm`)
  downloadZipFile(NSE_DUMP_URL, './downloads/nse-dump')
  downloadZipFile(BSE_DUMP_URL, './downloads/bse-dump')
})

cron.schedule('0 8 * * * ', () => {
  console.log(`cron ran successfully at 8am`)
  downloadZipFile(NSE_DUMP_URL, './downloads/nse-dump')
  downloadZipFile(BSE_DUMP_URL, './downloads/bse-dump')
})

// Configure multer to handle CSV file uploads
const storage = multer.memoryStorage() // Store files in memory
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed.'))
    }
  },
})

app.get('/', (req, res) => {
  res.send('Hello, from server!')
})

// Define a POST route for file upload
app.post('/upload', upload.single('csvFile'), (req, res) => {
  const uploadedFile = req.file
  if (uploadedFile) {
    const csvData = uploadedFile.buffer.toString() // Convert buffer to string

    const results = []
    csvParser()
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(results)
        // Process the 'results' array as needed
        res.json({ message: 'CSV file uploaded and processed successfully.' })
      })
      .write(csvData)
    res.json({
      message: 'CSV file uploaded and processed successfully.',
      isError: false,
    })
    main(results)
  } else {
    res.status(400).json({ error: 'No CSV file uploaded.', isError: true })
  }
})

// Define a route to download the generated Excel file
app.get('/download', (req, res) => {
  const filePath = join(__dirname, './output/investment_journal_v1.0.xlsx')

  // Set the appropriate headers for download
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=investment_journal_v1.0.xlsx'
  )

  // Send the file to the client
  res.sendFile(filePath)
})

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`)
})

const main = async (tradebookData) => {
  const stocksArray = []
  // List of CSV file paths
  const csvFilePaths = [
    './downloads/nse-dump/nse-dump.csv',
    './downloads/bse-dump/bse-dump.csv',
  ]

  try {
    const promises = csvFilePaths.map(readCSVFile)
    const [nseData, bseData] = await Promise.all(promises)

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
