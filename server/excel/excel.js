import ExcelJS from 'exceljs'
import {
  COLUMNS,
  ROW_HEIGHT,
  CHARGES_COLOR,
  HEADERS_COLOR,
  HYPERLINK_COLOR,
  TEXT_COLOR,
  TEXT_RED_COLOR,
  MERGE_CELLS_DATA,
  SUB_HEADERS_DATA,
  TOTALS_COLOR,
  WHITE_TEXT_COLOR,
  METRICS_REALIZED_HEADERS,
  METRICS_UNREALIZED_HEADERS,
  IDEAL_HEADERS,
} from './excel-constants.js'
import {
  addDataToSheet,
  applyTextWrapping,
  centerAlignAllText,
  colorRows,
  fillData,
  freezeColumns,
  generateFillData,
  setHeadersForSheet,
} from './excel-utils.js'

// Function to check if a value is a valid date in 'YYYY-MM-DD' format
const isDate = (value) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  return regex.test(value)
}

export const generateExcel = (array, invalidsArray, totalObject) => {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook()
  const portfolioSheet = workbook.addWorksheet('Portfolio')
  const invalidsSheet = workbook.addWorksheet('Invalids')
  const metricsSheet = workbook.addWorksheet('Metrics')

  generatePortfolioTemplate(portfolioSheet, array)
  generatePortfolioTemplate(invalidsSheet, invalidsArray)
  generateTotalsRow(portfolioSheet, totalObject, array)
  generateMetricsTemplate(metricsSheet, totalObject, array)
  return workbook
}

const generateTotalsRow = (portfolioSheet, totalObject, array) => {
  portfolioSheet.addRow(totalObject)
  const totalsRow = portfolioSheet.getRow(array.length + 4)
  totalsRow.font = {
    bold: true,
    italic: true,
    color: { argb: WHITE_TEXT_COLOR },
  }
  totalsRow.eachCell((cell) => {
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })
  totalsRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: TOTALS_COLOR },
  }
}

const generatePortfolioTemplate = (worksheet, array) => {
  // Set default row height for all rows
  worksheet.properties.defaultRowHeight = ROW_HEIGHT

  MERGE_CELLS_DATA.forEach((cell) => {
    worksheet.mergeCells(`${cell}1:${cell}2`)
  })

  worksheet.mergeCells('V1:AB1')
  const mergedCell = worksheet.getCell('V1')

  // Center the merged header
  mergedCell.alignment = { vertical: 'middle', horizontal: 'center' }

  SUB_HEADERS_DATA.forEach((eachCell) => {
    worksheet.getCell(`${eachCell.cell}2`).value = eachCell.label
  })

  setHeadersForSheet(worksheet, COLUMNS)

  addDataToSheet(array, worksheet)

  centerAlignAllText(worksheet)

  applyTextWrapping(1, 30, 1, worksheet, CHARGES_COLOR, HEADERS_COLOR)

  applyTextWrapping(22, 28, 2, worksheet, CHARGES_COLOR, CHARGES_COLOR)

  // Apply text color to cells from column A to AD and row 4 to array.length
  for (
    let row = 3;
    row <= Math.min(worksheet.actualRowCount + 1, array.length + 3);
    row++
  ) {
    for (let col = 1; col <= Math.min(30, worksheet.columns.length); col++) {
      const cell = worksheet.getCell(row, col)
      cell.font = { italic: true, color: { argb: TEXT_COLOR } } // Blue color
      // Apply red text color if cell value is less than 0
      if (
        !isDate(cell.value) &&
        (cell.value < 0 ||
          (typeof cell.value === 'string' && cell.value.includes('-')))
      ) {
        cell.font = { color: { argb: TEXT_RED_COLOR } } // Red color
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
      color: { argb: HYPERLINK_COLOR },
      underline: 'single',
    }
  }

  freezeColumns(worksheet, 2, 2)
}

const generateMetricsTemplate = (worksheet, totalObject, array) => {
  // Set default row height for all rows
  worksheet.properties.defaultRowHeight = ROW_HEIGHT

  // Merge cells, add heading, and center align in bold
  worksheet.mergeCells('A1:K1')
  worksheet.mergeCells('C3:D3')
  worksheet.mergeCells('J3:K3')

  colorRows(worksheet, [1, 2], HEADERS_COLOR)
  const mergedCell = worksheet.getCell('A1')
  mergedCell.value = 'Portfolio Metrics'
  mergedCell.alignment = { horizontal: 'center', vertical: 'middle' }
  mergedCell.font = { bold: true, color: { argb: TEXT_COLOR } }

  const realizedData = generateFillData(
    totalObject.realizedMetrics,
    METRICS_REALIZED_HEADERS[0]
  )
  const unrealizedData = generateFillData(
    totalObject.unrealizedMetrics,
    METRICS_UNREALIZED_HEADERS[0]
  )

  generateMetricsTable(
    worksheet,
    METRICS_REALIZED_HEADERS,
    realizedData,
    '3',
    'C',
    'D'
  )
  generateMetricsTable(
    worksheet,
    METRICS_UNREALIZED_HEADERS,
    unrealizedData,
    '3',
    'J',
    'K'
  )
  fillData(worksheet, '3', 'G', IDEAL_HEADERS, 'header', 10)
}

const generateMetricsTable = (worksheet, headers, data, row, col1, col2) => {
  fillData(worksheet, row, col1, headers, 'header')
  fillData(worksheet, row, col2, data, 'data')
}
