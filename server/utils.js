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

// Function to check if a value is a valid date in 'YYYY-MM-DD' format
function isDate(value) {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  return regex.test(value)
}
export const generateExcel = (array) => {
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
    'T',
    'U',
    'AC',
    'AD',
  ]
  const subHeaders = [
    { cell: 'V', label: 'Broker' },
    { cell: 'W', label: 'STT' },
    { cell: 'X', label: 'Exc. Ch.' },
    { cell: 'Y', label: 'SEBI Ch.' },
    { cell: 'Z', label: 'Stamp Ch.' },
    { cell: 'AA', label: 'GST' },
    { cell: 'AB', label: 'Income Tax' },
  ]
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Portfolio')

  // Set default row height for all rows
  worksheet.properties.defaultRowHeight = 25

  mergeCellsData.forEach((cell) => {
    worksheet.mergeCells(`${cell}1:${cell}2`)
  })

  worksheet.mergeCells('V1:AB1')
  const mergedCell = worksheet.getCell('V1')
  // Center the merged header
  mergedCell.alignment = { vertical: 'middle', horizontal: 'center' }

  subHeaders.forEach((eachCell) => {
    worksheet.getCell(`${eachCell.cell}2`).value = eachCell.label
    worksheet.getCell(`${eachCell.cell}2`).font = { bold: true }
  })

  // Define column headers and set them bold
  const columns = [
    { header: 'SNo.', key: 'id', width: 5 },
    { header: 'Symbol', key: 'Symbol', width: 15 },
    { header: 'Qty', key: 'Qty', width: 10 },
    { header: 'Chart', key: 'Chart Link', width: 10 },
    { header: 'First Buy Date', key: 'First Buy Date', width: 15 },
    { header: 'Latest Buy Date', key: 'Latest Buy Date', width: 15 },
    { header: 'First Buy Price', key: 'First Buy Price', width: 10 },
    { header: 'Buy Price', key: 'Buy Price', width: 10 },
    { header: 'LTP', key: 'LTP', width: 10 },
    { header: 'Exchange', key: 'Exchange', width: 5 },
    { header: 'Type', key: 'Trade Type', width: 5 },
    { header: 'Invested Amount', key: 'Invested Amount', width: 15 },
    { header: 'Sell Price', key: 'Sell Price', width: 10 },
    { header: 'Sell date', key: 'Sell date', width: 15 },
    { header: 'Realized Gain', key: 'Realized Gain', width: 10 },
    { header: 'Unrealized Gain', key: 'Unrealized Gain', width: 10 },
    { header: 'Realized Gain %', key: 'Realized Gain %', width: 10 },
    { header: 'Unrealized Gain %', key: 'Unrealized Gain %', width: 10 },
    { header: 'Trailing SL', key: 'Trailing SL', width: 10 },
    { header: 'Trailing SL %', key: 'Trailing SL %', width: 10 },
    { header: 'Gains at SL hit', key: 'Gains at SL hit', width: 10 },
    { header: 'Charges (Ch.)', key: 'Brokerage', width: 10 },
    { header: 'Charges (Ch.)', key: 'STT', width: 10 },
    { header: 'Charges (Ch.)', key: 'Exchange Charges', width: 10 },
    { header: 'Charges (Ch.)', key: 'SEBI Charge', width: 10 },
    { header: 'Charges (Ch.)', key: 'Stamp charges', width: 10 },
    { header: 'Charges (Ch.)', key: 'GST', width: 10 },
    { header: 'Charges (Ch.)', key: 'Income Tax', width: 10 },
    { header: 'Net Real. Gain', key: 'Net Realized Gain', width: 10 },
    { header: 'Net Real. %', key: 'Net Realized %', width: 10 },
  ]
  worksheet.columns = columns
  worksheet.getRow(1).font = { bold: true }

  // Add data rows
  array.forEach((row) => {
    worksheet.addRow(row)
  })

  // Iterate through each row and cell to set alignment
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })
  })

  // Apply text wrapping to specific headers (columns A to AC)
  for (let col = 1; col <= 30; col++) {
    const headerCell = worksheet.getRow(1).getCell(col) // Assuming headers are in the first row
    headerCell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    }
    headerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: col === 28 ? '#fcbf49' : '#92D050' }, // Orange color
    }
    headerCell.border = {
      top: { style: 'thin', color: { argb: '14213d' } },
      left: { style: 'thin', color: { argb: '14213d' } },
      bottom: { style: 'thin', color: { argb: '14213d' } },
      right: { style: 'thin', color: { argb: '14213d' } },
    }
  }
  // Apply text wrapping to sub headers (columns A to AC)
  for (let col = 22; col <= 28; col++) {
    const headerCell = worksheet.getRow(2).getCell(col) // Assuming headers are in the first row
    headerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '#fcbf49' }, // Orange color
    }
    headerCell.border = {
      top: { style: 'thin', color: { argb: '14213d' } },
      left: { style: 'thin', color: { argb: '14213d' } },
      bottom: { style: 'thin', color: { argb: '14213d' } },
      right: { style: 'thin', color: { argb: '14213d' } },
    }
  }

  // // Apply italics text style and change text color to blue for cells in rows 4 to 10
  // for (let row = 4; row <= Math.min(10, array.length + 3); row++) {
  //   const rowCells = worksheet.getRow(row).cells
  //   rowCells.forEach((cell) => {
  //     cell.font = { italic: true, color: { argb: '14213d' } } // Blue color
  //   })
  // }
  // Apply text color to cells from column A to AD and row 4 to array.length
  for (
    let row = 3;
    row <= Math.min(worksheet.actualRowCount + 1, array.length + 3);
    row++
  ) {
    for (let col = 1; col <= Math.min(30, worksheet.columns.length); col++) {
      const cell = worksheet.getCell(row, col)
      cell.font = { italic: true, color: { argb: '14213d' } } // Blue color
      // Apply red text color if cell value is less than 0
      if (
        !isDate(cell.value) &&
        (cell.value < 0 ||
          (typeof cell.value === 'string' && cell.value.includes('-')))
      ) {
        cell.font = { color: { argb: 'FFFF0000' } } // Red color
      }
    }
  }

  // Apply hyperlinks with shortened text to cells in column D, starting from the third row
  for (let row = 3; row <= array.length + 2; row++) {
    const websiteCell = worksheet.getCell(`D${row}`)
    websiteCell.value = {
      text: 'Chart',
      hyperlink: worksheet.getCell(`D${row}`).value,
    }
    websiteCell.font = {
      italic: true,
      color: { argb: '#5a189a' },
      underline: 'single',
    }
  }

  // Freeze the first column (column A)
  worksheet.views = [
    {
      state: 'frozen',
      xSplit: 2, // Number of columns to freeze from left (1 means column A)
      ySplit: 2, // Number of rows to freeze from top
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

export const dateDifferenceGreaterThan365 = (dateStr1, dateStr2) => {
  const date1 = new Date(dateStr1)
  const date2 = new Date(dateStr2)

  // Calculate the time difference in milliseconds between the two dates
  const timeDifference = Math.abs(date2 - date1)

  // Convert milliseconds to days
  const daysDifference = timeDifference / (1000 * 60 * 60 * 24)

  return daysDifference > 365
}

export const getIncomeTax = (isLTCG, profit) => {
  if (profit > 0) {
    return isLTCG ? formatValue(0.1 * profit) : formatValue(0.15 * profit)
  } else {
    return 0
  }
}

export const getCharges = (investedAmount, exchange) => {
  const SEBICharges = formatValue(investedAmount / 1000000)
  const stampCharges = formatValue(0.00015 * investedAmount)
  const stt = formatValue(investedAmount / 1000)
  const exchangeCharges =
    exchange === 'BSE'
      ? formatValue(0.0000375 * investedAmount)
      : formatValue(0.0000325 * investedAmount)
  const gst = formatValue(0.18 * (SEBICharges + exchangeCharges))
  return {
    stt,
    exchangeCharges,
    gst,
    stampCharges,
    SEBICharges,
  }
}

export const getInvestedAmount = (qty, price) => formatValue(qty * price)
export const getProfit = (sellPrice, buyPrice, qty) =>
  formatValue((sellPrice - buyPrice) * qty)

export const getProfitPer = (profit, investedAmount) =>
  `${formatValue(profit / investedAmount)}%`
export const getStopLossPrice = (price) => formatValue(0.9 * price)
export const getStopLossAmount = (stopLossPrice, buyPrice, qty) =>
  formatValue((stopLossPrice - buyPrice) * qty)

export const logToFile = (data, filePath) => {
  try {
    const jsonData = JSON.stringify(data, null, 2) // null and 2 for pretty formatting
    fs.appendFileSync(filePath, jsonData + '\n')
    console.log('Data has been logged to the file.')
  } catch (error) {
    console.error('Error writing to file:', error)
  }
}
