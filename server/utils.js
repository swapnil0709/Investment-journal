import https from 'https'
import fs from 'fs'
import csv from 'csv-parser'
import path from 'path'
import unzipper from 'unzipper'
import axios from 'axios'
import CsvFile from './mongodb/models/csvfile.js'
import { BASE_BSE_URL, BASE_NSE_URL } from './const.js'

export const getCurrentMonthAbbreviation = (givenDate) => {
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
  const currentMonth = givenDate.getMonth()

  const currentMonthAbbreviation = months[currentMonth]
  return currentMonthAbbreviation
}

export const getBseUrl = (givenDate) => {
  const day = String(givenDate.getDate()).padStart(2, '0')
  const month = String(givenDate.getMonth() + 1).padStart(2, '0') // Months are 0-based
  const currentYear = givenDate.getFullYear()
  const bseDate = `${day}${month}${currentYear}`
  return `${BASE_BSE_URL}${bseDate}.ZIP`
}

export const getNseUrl = (givenDate) => {
  const day = String(givenDate.getDate()).padStart(2, '0')
  const monthAbr = getCurrentMonthAbbreviation(givenDate)
  const currentYear = givenDate.getFullYear()
  const nseDate = `${day}${getCurrentMonthAbbreviation(
    givenDate
  )}${currentYear}`
  return `${BASE_NSE_URL}${currentYear}/${monthAbr}/cm${nseDate}bhav.csv.zip`
}

export const downloadExtractAndStoreCsvFiles = async (date, exchange = '') => {
  if (exchange === 'nse') {
    const nseUrl = getNseUrl(date)
    await processURL(nseUrl, date)
  } else if (exchange === 'bse') {
    const bseUrl = getBseUrl(date)
    await processURL(bseUrl, date)
  } else {
    const nseUrl = getNseUrl(date)
    const bseUrl = getBseUrl(date)
    await processURL(nseUrl, date)
    await processURL(bseUrl, date)
  }
}

const processURL = async (zipUrl, date) => {
  const isNSE = zipUrl.includes('nse')
  const exchange = isNSE ? 'nse' : 'bse'

  try {
    const fileName = isNSE ? 'nse-dump.csv' : 'bse-dump.csv'

    const response = await axios.get(zipUrl, { responseType: 'arraybuffer' })
    const zipBuffer = Buffer.from(response.data)
    const extractedFiles = await unzipper.Open.buffer(zipBuffer)

    const csvFiles = extractedFiles.files.filter((file) =>
      file.path.endsWith('.csv')
    )

    for (const csvFile of csvFiles) {
      console.log(`Downloaded & extracted file: ${csvFile}`)
      const csvBuffer = await csvFile.buffer()
      const newName = fileName // Replace with the new name

      // Check if a record with the same name already exists
      const existingRecord = await CsvFile.findOne({ name: newName })

      if (existingRecord) {
        // Update the existing record with new CSV data
        existingRecord.data = csvBuffer
        await existingRecord.save()
      } else {
        // Create a new record
        const newCsvFile = new CsvFile({
          name: newName,
          data: csvBuffer,
          contentType: 'text/csv',
        })
        await newCsvFile.save()
      }
    }

    console.log('CSV files extracted, renamed, and updated in MongoDB.')
  } catch (error) {
    console.error(
      'Error occurred while processing the ZIP file, trying to download for a prev date',
      error
    )
    const prevDate = getYesterdayExcludingWeekends(date)
    downloadExtractAndStoreCsvFiles(prevDate, exchange)
  }
}
export const readCsvDataFromDatabase = async (fileName) => {
  try {
    const csvFile = await CsvFile.findOne({ name: fileName })

    if (!csvFile) {
      throw new Error(`CSV file "${fileName}" not found.`)
    }

    const dataArray = []

    const parser = csv()
    parser.on('data', (row) => {
      dataArray.push(row)
    })

    const csvDataBuffer = csvFile.data
    const csvDataString = csvDataBuffer.toString('utf-8')

    // Pipe the CSV data string through the parser
    parser.write(csvDataString)
    parser.end()

    return dataArray
  } catch (error) {
    console.error('Error reading CSV data:', error)
    return null
  }
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

export const convertPerToNumber = (percentageString) => {
  const isString = typeof percentageString === 'string'
  // Remove the percentage sign and convert to a number
  return isString
    ? parseFloat(percentageString.replace('%', ''))
    : percentageString
}

export const getSum = (array, param) =>
  array.reduce(
    (accumulator, currentValue) => accumulator + Number(currentValue[param]),
    0
  )
export const getSumPer = (array, param) =>
  array.reduce((accumulator, currentValue) => {
    return accumulator + convertPerToNumber(currentValue[param])
  }, 0)

export const getAvg = (array, param) => {
  const avg = getSum(array, param) / array.length
  return Number(avg.toFixed(2))
}

export const getAvgPer = (array, param) => {
  const avg = getSumPer(array, param) / array.length
  return Number(avg.toFixed(2))
}

export const compareString = (str1, str2) =>
  str1.trim().toLowerCase() === str2.trim().toLowerCase()

export const getStockParamValue = (array, param) =>
  array?.length ? array[0][param] : ''

export const formatValue = (value) => Number(value.toFixed(2))

export const formatePer = (value) => `${formatValue(value)}%`

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

export const getTotalGain = (array, param) => formatValue(getSum(array, param))

export const getMetricsData = (allTrades, totalGain, param) => {
  const capitalOnProfits = formatValue(getSum(allTrades, 'Invested Amount'))
  const profitPer = `${formatValue((totalGain / capitalOnProfits) * 100)}%`
  const paramPer = `${param} %`
  const noOfTrades = allTrades.length

  const countOfGains = allTrades.filter(
    (eachTrade) => eachTrade[param] > 0
  ).length

  const profitablePer = formatValue((countOfGains / noOfTrades) * 100)

  const lossPer = 100 - profitablePer

  const positiveGainPerArray = allTrades.filter(
    (eachTrade) => convertPerToNumber(eachTrade[paramPer]) > 0
  )

  const negativeGainPerArray = allTrades.filter(
    (eachTrade) => convertPerToNumber(eachTrade[paramPer]) < 0
  )

  const avgGain = getAvgPer(positiveGainPerArray, paramPer)

  const avgLoss = getAvgPer(negativeGainPerArray, paramPer)

  const gainLoss = formatValue((avgGain / avgLoss) * -1)

  const multipleRatio = formatValue((profitablePer / lossPer) * gainLoss)

  return {
    profits: totalGain,
    capitalOnWhichProfits: capitalOnProfits,
    profitsPer: profitPer,
    noOfTradesCompleted: noOfTrades,
    profitablePer: formatePer(profitablePer),
    lossPer: formatePer(lossPer),
    avgGain,
    avgLoss,
    gainLoss,
    multipleRatio,
  }
}

export const isCSVFilePresent = (directoryPath, fileName) => {
  const filePath = path.join(directoryPath, fileName)

  try {
    const stats = fs.statSync(filePath)
    return stats.isFile() && path.extname(filePath).toLowerCase() === '.csv'
  } catch (error) {
    return false
  }
}

export const sortArrayByDate = (array, date) =>
  array.sort((a, b) => new Date(a[date]) - new Date(b[date]))

export function getYesterdayExcludingWeekends(date) {
  const tmpDate = new Date(date)
  const dayOfWeek = tmpDate.getDay()

  // If it's Monday, subtract 3 days to get the previous Friday.
  if (dayOfWeek === 1) {
    tmpDate.setDate(tmpDate.getDate() - 3)
  } else {
    // For other weekdays, simply subtract 1 day to get the previous day.
    tmpDate.setDate(tmpDate.getDate() - 1)
  }

  // Check if the result is a Saturday or Sunday and adjust accordingly.
  if (tmpDate.getDay() === 0) {
    // Sunday
    tmpDate.setDate(tmpDate.getDate() - 2) // Subtract 2 days to get the previous Friday.
  } else if (tmpDate.getDay() === 6) {
    // Saturday
    tmpDate.setDate(tmpDate.getDate() - 1) // Subtract 1 day to get the previous Friday.
  }

  return tmpDate
}
