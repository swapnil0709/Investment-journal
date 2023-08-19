import { convertPerToNumber } from '../utils.js'
import {
  CHARGES_COLOR,
  HEADERS_COLOR,
  OUTPUT_PATH,
  ROW_WIDTH,
  TEXT_COLOR,
  TEXT_RED_COLOR,
  TOTALS_COLOR,
  WHITE_TEXT_COLOR,
} from './excel-constants.js'
import csv from 'csv-parser'

export const writeExcel = (workbook) => {
  // Write the workbook to a file
  workbook.xlsx
    .writeFile(OUTPUT_PATH)
    .then(() => {
      console.log(`XLSX file generated at: ${OUTPUT_PATH}`)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

export const freezeColumns = (worksheet, noOfColToFreeze, noOfRowsToFreeze) => {
  worksheet.views = [
    {
      state: 'frozen',
      xSplit: noOfColToFreeze, // Number of columns to freeze from left (1 means column A)
      ySplit: noOfRowsToFreeze, // Number of rows to freeze from top
      topLeftCell: 'B2', // Top-left cell of the unfrozen section
    },
  ]
}

export const centerAlignAllText = (worksheet) => {
  // Iterate through each row and cell to set alignment
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })
  })
}

export const setHeadersForSheet = (worksheet, columns) => {
  // Define column headers and set them bold
  worksheet.columns = columns
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(2).font = { bold: true }
}

export const addDataToSheet = (array, worksheet) => {
  // Add data rows
  array.forEach((row) => {
    worksheet.addRow(row)
  })
}

export const applyTextWrapping = (
  startIndex,
  endIndex,
  rowNo,
  worksheet,
  chargesColor,
  headersColor
) => {
  // Apply text wrapping to specific headers (columns startIndex to endIndex)
  for (let col = startIndex; col <= endIndex; col++) {
    const headerCell = worksheet.getRow(rowNo).getCell(col) // Assuming headers are in the first row
    headerCell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    }
    headerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: col === 28 ? chargesColor : headersColor },
    }
    headerCell.border = {
      top: { style: 'thin', color: { argb: '14213d' } },
      left: { style: 'thin', color: { argb: '14213d' } },
      bottom: { style: 'thin', color: { argb: '14213d' } },
      right: { style: 'thin', color: { argb: '14213d' } },
    }
  }
}

export const colorRows = (worksheet, rowsArray, color) => {
  rowsArray.forEach((row) => {
    const selectedRow = worksheet.getRow(row)
    selectedRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: color },
    }
  })
}

export const clearAllBorders = (worksheet) => {
  // Clear all cell borders and their colors
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = undefined
    })
  })
}

export const fillData = (
  worksheet,
  startRowIndex,
  colName,
  data,
  type,
  customWidth = ROW_WIDTH
) => {
  let rowIndex = startRowIndex
  const isHeader = type === 'header'
  const headingName = `${colName}${startRowIndex}`
  const headerCell = worksheet.getCell(headingName)

  worksheet.getColumn(colName).width = customWidth
  data.forEach((eachData) => {
    const eachCell = worksheet.getCell(`${colName}${rowIndex}`)
    eachCell.value = eachData.label
    eachCell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    }
    eachCell.font = {
      bold: isHeader ? true : false,
      italic: true,
      color: { argb: TEXT_COLOR },
    }
    if (isHeader) {
      eachCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: CHARGES_COLOR },
      }
    }
    handleValidationHighlighting(eachData, eachCell)
    rowIndex++
  })
  headerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: TOTALS_COLOR },
  }
  headerCell.font = {
    color: { argb: WHITE_TEXT_COLOR },
  }
}

export const generateFillData = (object, header) => {
  const resultArray = [header]
  for (let key in object) {
    resultArray.push({ key: key, label: object[key] })
  }
  return resultArray
}

const handleValidationHighlighting = (eachData, cell) => {
  switch (eachData?.key) {
    case 'profitablePer':
      applyTextColourOnCondition(eachData, cell, 45, 'less')
      break
    case 'lossPer':
      applyTextColourOnCondition(eachData, cell, 55, 'greater')
      break
    case 'gainLoss':
      applyTextColourOnCondition(eachData, cell, 3, 'less')
      break
    case 'multipleRatio':
      applyTextColourOnCondition(eachData, cell, 2, 'less')
      break

    default:
  }
}

const applyTextColourOnCondition = (eachData, cell, value, compareType) => {
  const compareCondition =
    compareType === 'greater'
      ? convertPerToNumber(eachData?.label) > value
      : convertPerToNumber(eachData?.label) < value
  if (compareCondition) {
    cell.font = {
      bold: true,
      italic: true,
      color: { argb: TEXT_RED_COLOR },
    }
  }
}

export const parseCsvFile = async (csvFile) => {
  try {
    if (!csvFile) {
      throw new Error(`CSV file not found.`)
    }

    const dataArray = []

    const parser = csv()
    parser.on('data', (row) => {
      dataArray.push(row)
    })

    const csvDataBuffer = csvFile
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
