import { OUTPUT_PATH } from './excel-constants.js'

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

export const fillData = (worksheet, startRowIndex, colName, data) => {
  let rowIndex = startRowIndex
  worksheet.getColumn(colName).width = 25
  data.forEach((eachData) => {
    const eachCell = worksheet.getCell(`${colName}${rowIndex}`)
    eachCell.value = eachData.label
    eachCell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    }
    rowIndex++
  })
}
