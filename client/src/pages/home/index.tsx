import axios from 'axios'
import React, { ChangeEvent, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

const ExcelReader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  axios.defaults.withCredentials = true
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setSelectedFile(selectedFile)
    }
  }

  const handleUploadAndDownload = async () => {
    if (!selectedFile) {
      console.error('No file selected.')
      return
    }

    const formData = new FormData()
    formData.append('csvFile', selectedFile)
    // 'http://localhost:8080/uploadAndDownload',
    // 'https://investment-journal-server.vercel.app/uploadAndDownload',

    try {
      const response = await axios.post(
        'https://investment-journal-server.vercel.app/uploadAndDownload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob',
        }
      )

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'investment_journal_v1.0.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      setIsSuccess(true)
    } catch (error) {
      setIsError(true)
      console.error('Error uploading and downloading file:', error)
    }
  }

  return (
    <div className='logo'>
      <div className='input-wrapper'>
        <input
          type='file'
          accept='.csv'
          onChange={handleFileChange}
          className='custom-input'
          placeholder='Upload file'
        />
      </div>

      <button disabled={!selectedFile} onClick={handleUploadAndDownload}>
        Upload CSV and Download Excel
      </button>
      {isSuccess && (
        <Alert severity='success'>
          <AlertTitle>Successfully Downloaded! ✅</AlertTitle>
        </Alert>
      )}
      {isError && (
        <Alert severity='error'>
          <AlertTitle>An Error Occurred 🙁</AlertTitle>
        </Alert>
      )}
    </div>
  )
}

export default ExcelReader
