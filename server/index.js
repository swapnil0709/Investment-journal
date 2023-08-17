import * as dotenv from 'dotenv'
import { BSE_DUMP_URL, NSE_DUMP_URL } from './const.js'

import { downloadExtractAndStoreCsvFiles } from './utils.js'
import express from 'express'
import cron from 'node-cron'
import cors from 'cors'
import connectDB from './mongodb/connect.js'
import { PORT } from './config.js'
import appRouter from './routes/app.routes.js'

dotenv.config()

const app = express()

app.use(
  cors({
    origin: ['https://investment-journal.vercel.app'],
    methods: ['POST', 'GET'],
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use('/', appRouter)

const startServer = async () => {
  try {
    // connect to mongodb
    connectDB(process.env.MONGODB_URL)
    app.listen(PORT, () =>
      console.log(
        `Server started on port https://investment-journal.vercel.app/:${PORT}`
      )
    )
  } catch (error) {
    console.error(`Error starting server ${error}`)
  }
}
startServer()

// Schedule cron jobs

cron.schedule('0 20 * * * ', () => {
  console.log(`cron ran successfully at 8pm`)
  downloadExtractAndStoreCsvFiles(NSE_DUMP_URL)
  downloadExtractAndStoreCsvFiles(BSE_DUMP_URL)
})

cron.schedule('0 8 * * * ', () => {
  console.log(`cron ran successfully at 8am`)
  downloadExtractAndStoreCsvFiles(NSE_DUMP_URL)
  downloadExtractAndStoreCsvFiles(BSE_DUMP_URL)
})

// Use the cors middleware to allow requests from the React frontend
// app.use(
//   cors({
//     origin: ['https://investment-journal.vercel.app'],
//     methods: ['POST', 'GET'],
//     credentials: true,
//   })
// )
