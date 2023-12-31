import * as dotenv from 'dotenv'

import { downloadExtractAndStoreCsvFiles } from './utils.js'
import express from 'express'
import cors from 'cors'
import connectDB from './mongodb/connect.js'
import { CLIENT_DOMAIN, PORT } from './config.js'
import appRouter from './routes/app.routes.js'
import multer from 'multer'
import { generateExcelWorkbook } from './controllers/app.controller.js'
import { parseCsvFile } from './excel/excel-utils.js'
import CsvFile from './mongodb/models/csvfile.js'

dotenv.config()

const app = express()

app.use(express.json({ limit: '10mb' }))
// app.use(cors())
app.use(
  cors({
    origin: [CLIENT_DOMAIN],
    methods: ['POST', 'GET'],
  })
)

// Set up multer for handling file uploads
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.get('/api/cron', async (req, res) => {
  console.log(`cron ran on vercel`)
  const currentDate = new Date().toISOString().slice(0, 10)
  // Check if a record with the same name already exists
  const existingRecord = await CsvFile.findOne({ createdDate: currentDate })

  if (!existingRecord) {
    await downloadExtractAndStoreCsvFiles(new Date())
  } else {
    console.log('File already exists')
  }
  res.status(200).end('Hello Cron!')
})

app.post('/uploadAndDownload', upload.single('csvFile'), async (req, res) => {
  const uploadedFile = req.file

  if (!uploadedFile) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const tradeBookData = await parseCsvFile(uploadedFile.buffer)
  const workBook = await generateExcelWorkbook(tradeBookData)

  res.setHeader('Content-Disposition', 'attachment; filename=export.xlsx')
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )

  workBook.xlsx
    .write(res)
    .then(() => {
      res.end()
    })
    .catch((error) => {
      console.error('Error writing Excel workbook:', error)
      res.status(500).json({ error: 'Error writing Excel workbook' })
    })
})

app.use('/', appRouter)

const startServer = async () => {
  try {
    // connect to mongodb
    connectDB(process.env.MONGODB_URL)
    app.listen(PORT, () =>
      console.log(`Server started successfully at http://localhost:${PORT}`)
    )
  } catch (error) {
    console.error(`Error starting server ${error}`)
  }
}
startServer()
