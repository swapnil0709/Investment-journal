import https from 'https'
import fs from 'fs'
import AdmZip from 'adm-zip'
import csv from 'csv-parser'
import ExcelJS from 'exceljs'

const today = new Date()
const day = String(today.getDate()).padStart(2, '0')
const month = String(today.getMonth() + 1).padStart(2, '0') // Months are 0-based
export const CURRENT_YEAR = today.getFullYear()

export const BSE_DATE = `${day}${month}${CURRENT_YEAR}`

export const getCurrentMonthAbbreviation = () => {
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ]
  const today = new Date()
  const currentMonth = today.getMonth()

  const currentMonthAbbreviation = months[currentMonth]
  return currentMonthAbbreviation
}

export const NSE_DATE = `${day}${getCurrentMonthAbbreviation()}${CURRENT_YEAR}`

export const downloadFile = (url, localFilePath) => {
  const fileStream = fs.createWriteStream(localFilePath)
  https
    .get(url, (response) => {
      response.pipe(fileStream)

      fileStream.on('finish', () => {
        fileStream.close()
        console.log('File downloaded and saved:', localFilePath)
      })
    })
    .on('error', (err) => {
      fs.unlink(localFilePath, () => {}) // Delete the file if an error occurs
      console.error('Error downloading file:', err.message)
    })
}

export const downloadZipFile = (url, extractionPath) => {
  https
    .get(url, (response) => {
      if (response.statusCode !== 200) {
        console.error('Failed to download the zip file')
        return
      }

      const data = []
      response.on('data', (chunk) => data.push(chunk))
      response.on('end', () => {
        const buffer = Buffer.concat(data)
        const zip = new AdmZip(buffer)

        try {
          fs.mkdirSync(extractionPath, { recursive: true }) // Create extraction directory
          zip.extractAllTo(extractionPath, true)
          console.log('Zip file extracted to:', extractionPath)
        } catch (error) {
          console.error('Error extracting zip file:', error)
        }
      })
    })
    .on('error', (err) => {
      console.error('Error downloading zip file:', err.message)
    })
}

export const readCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = []

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data)
      })
      .on('end', () => {
        resolve(results)
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

export const getSum = (array, param) =>
  array.reduce(
    (accumulator, currentValue) => accumulator + Number(currentValue[param]),
    0
  )

export const getAvg = (array, param) => {
  const avg = getSum(array, param) / array.length
  return Number(avg.toFixed(2))
}

export const compareString = (str1, str2) =>
  str1.trim().toLowerCase() === str2.trim().toLowerCase()

export const getStockParamValue = (array, param) =>
  array?.length ? array[0][param] : ''

export const formatValue = (value) => Number(value.toFixed(2))

export const generateExcel = (array) => {
  // Convert array of objects to worksheet
  const worksheet = XLSX.utils.json_to_sheet(array)

  // Get the range of column headers (A1:C1)
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  for (let col = range.s.c; col <= range.e.c; col++) {
    const headerCell = XLSX.utils.encode_cell({ c: col, r: range.s.r })
    worksheet[headerCell].s = { bold: true }
  }
  // Create a new workbook
  const workbook = XLSX.utils.book_new()

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Portfolio')

  // Specify the file path for the XLSX file
  const filePath = './output/investment journal.xlsx'

  // Write the workbook to a file
  XLSX.writeFile(workbook, filePath)

  console.log(`XLSX file generated at: ${filePath}`)
}

export const generateNewExcel = (array) => {
  const mergeCellsData = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'AA',
    'AB',
  ]
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Portfolio')

  mergeCellsData.forEach((cell) => {
    worksheet.mergeCells(`${cell}1:${cell}2`)
  })
  worksheet.mergeCells('T1:Z1')
  const mergedCell = worksheet.getCell('T1')
  // Center the merged header
  mergedCell.alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.getCell('A1').value = 'Symbol'
  worksheet.getCell('A1').font = { bold: true }

  worksheet.getCell('T1').value = 'Charges'
  worksheet.getCell('T1').font = { bold: true }

  worksheet.getCell('T2').value = 'Brokerage'
  worksheet.getCell('T2').font = { bold: true }

  worksheet.getCell('U2').value = 'STT'
  worksheet.getCell('U2').font = { bold: true }

  worksheet.getCell('V2').value = 'Exchange Charges'
  worksheet.getCell('V2').font = { bold: true }

  worksheet.getCell('W2').value = 'SEBI Charge'
  worksheet.getCell('W2').font = { bold: true }

  worksheet.getCell('X2').value = 'Stamp charges'
  worksheet.getCell('X2').font = { bold: true }

  worksheet.getCell('Y2').value = 'GST'
  worksheet.getCell('Y2').font = { bold: true }

  worksheet.getCell('Z2').value = 'Income Tax'
  worksheet.getCell('Z2').font = { bold: true }

  // Define column headers and set them bold
  const columns = [
    { header: 'SNo.', key: 'SNo.', width: 15 },
    { header: 'Symbol', key: 'Symbol', width: 15 },
    { header: 'Qty', key: 'Qty', width: 10 },
    { header: 'First Buy Date', key: 'First Buy Date', width: 15 },
    { header: 'Latest Buy Date', key: 'Latest Buy Date', width: 15 },
    { header: 'First Buy Price', key: 'First Buy Price', width: 10 },
    { header: 'Buy Price', key: 'Buy Price', width: 10 },
    { header: 'LTP', key: 'LTP', width: 10 },
    { header: 'Exchange', key: 'Exchange', width: 10 },
    { header: 'Trade Type', key: 'Trade Type', width: 10 },
    { header: 'Invested Amount', key: 'Invested Amount', width: 15 },
    { header: 'Sell Price', key: 'Sell Price', width: 10 },
    { header: 'Sell date', key: 'Sell date', width: 10 },
    { header: 'Realized Gain', key: 'Realized Gain', width: 10 },
    { header: 'Unrealized Gain', key: 'Unrealized Gain', width: 20 },
    { header: 'Realized Gain %', key: 'Realized Gain %', width: 10 },
    { header: 'Unrealized Gain %', key: 'Unrealized Gain %', width: 10 },
    { header: 'Stop Loss', key: 'Stop Loss', width: 10 },
    { header: 'Stop Loss % Away', key: 'Stop Loss % Away', width: 10 },
    { header: 'Gains at Stop Loss', key: 'Gains at Stop Loss', width: 10 },
    { header: 'Charges', key: 'Brokerage', width: 10 },
    { header: 'Charges', key: 'STT', width: 10 },
    { header: 'Charges', key: 'Exchange Charges', width: 10 },
    { header: 'Charges', key: 'SEBI Charge', width: 10 },
    { header: 'Charges', key: 'Stamp charges', width: 10 },
    { header: 'Charges', key: 'GST', width: 10 },
    { header: 'Charges', key: 'Income Tax', width: 10 },
    { header: 'Net Realized Gain', key: 'Net Realized Gain', width: 10 },
    { header: 'Net Realized %', key: 'Net Realized %', width: 10 },
  ]
  worksheet.columns = columns
  worksheet.getRow(1).font = { bold: true }

  // Add data rows
  array.forEach((row) => {
    worksheet.addRow(row)
  })

  // Freeze the first column (column A)
  worksheet.views = [
    {
      state: 'frozen',
      xSplit: 1, // Number of columns to freeze from left (1 means column A)
      ySplit: 1, // Number of rows to freeze from top
      topLeftCell: 'B2', // Top-left cell of the unfrozen section
    },
  ]

  // Specify the file path for the XLSX file
  const filePath = './output/investment journal.xlsx'

  // Write the workbook to a file
  workbook.xlsx
    .writeFile(filePath)
    .then(() => {
      console.log(`XLSX file generated at: ${filePath}`)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}
