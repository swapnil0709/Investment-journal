import { BSE_DUMP_URL, NSE_DUMP_URL } from '../const.js'
import { downloadExtractAndStoreCsvFiles } from '../utils.js'

export default function handler(req, res) {
  console.log('cron ran for vercel')
  downloadExtractAndStoreCsvFiles(NSE_DUMP_URL)
  downloadExtractAndStoreCsvFiles(BSE_DUMP_URL)
  res.status(200).end('Hello Cron!')
}
