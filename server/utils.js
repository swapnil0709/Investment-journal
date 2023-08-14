import https from 'https'
import fs from 'fs'
import AdmZip from 'adm-zip'
import csv from 'csv-parser'

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

export const addIdForEachRecord = (array) => {
  return array.map((eachObj, idx) => ({
    id: idx + 1,
    ...eachObj,
  }))
}
