import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import ExcelUploader from '../../components/file-uploader'
import { cleanExcelData } from '../../utils'

const ExcelReader: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [excelData, setExcelData] = useState<null | any[]>(null)

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const data = e.target?.result as string
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)
      setExcelData(cleanExcelData(jsonData))
    }

    reader.readAsBinaryString(file)
  }

  useEffect(() => {
    if (excelData?.length) {
      console.log(excelData)
    }
  }, [excelData])

  return (
    <div>
      <h2>Excel File Upload</h2>
      <ExcelUploader onFileUpload={handleFileUpload} />
    </div>
  )
}

export default ExcelReader
