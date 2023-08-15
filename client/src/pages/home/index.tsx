import axios from 'axios'
import React, { ChangeEvent, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

const ExcelReader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploaded, setIsUploaded] = useState(false)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    }
  }
  const handleDownload = () => {
    // Trigger the download
    window.location.href =
      'https://investment-journal-1x1tim4u5-swapnil0709.vercel.app/download'
  }
  const handleUpload = (): void => {
    if (selectedFile) {
      const formData = new FormData()
      formData.append('csvFile', selectedFile)

      axios
        .post(
          'https://investment-journal-1x1tim4u5-swapnil0709.vercel.app/upload',
          formData
        )
        .then((response) => {
          console.log(response.data.message)
          setIsUploaded(!response.data.isError)
        })
        .catch((error) => {
          console.error('Error:', error)
        })
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

      {/* <input type='file' accept='.csv' onChange={handleFileChange} /> */}
      <button disabled={isUploaded} onClick={handleUpload}>
        Upload CSV
      </button>
      <button disabled={!isUploaded} onClick={handleDownload}>
        Download Excel
      </button>
      {isUploaded && (
        <Alert severity='success'>
          <AlertTitle>Successfully Uploaded!</AlertTitle>
          Now click on — <strong>Download Excel!</strong>
        </Alert>
      )}
    </div>
  )
}

export default ExcelReader
