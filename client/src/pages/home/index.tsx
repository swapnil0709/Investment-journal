import axios from 'axios'
import React, { ChangeEvent, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { saveAs } from 'file-saver'
import { EXCEL_FILE_NAME, SERVER_DOMAIN, TRADE_BOOK_URL } from '../../const'
import CircularProgress from '@mui/material/CircularProgress'

const Home: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const isButtonDisabled = isLoading || !selectedFile
  axios.defaults.withCredentials = true
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setSelectedFile(selectedFile)
    }
  }

  const handleUploadAndDownload = async () => {
    setIsLoading(true)

    if (!selectedFile) {
      console.error('No file selected.')
      return
    }
    if (
      selectedFile.type !== 'text/csv' &&
      !selectedFile.name.toLowerCase().includes('tradebook')
    ) {
      setIsError(true)
      setIsLoading(false)
      setErrorMessage('Please upload tradebook file in csv format only.')
      return
    } else if (selectedFile.type !== 'text/csv') {
      setIsError(true)
      setIsLoading(false)
      setErrorMessage('Please upload a csv file only.')
      return
    } else if (!selectedFile.name.toLowerCase().includes('tradebook')) {
      setIsLoading(false)
      setIsError(true)
      setErrorMessage('Please upload tradebook file only without renaming.')
      return
    }

    const formData = new FormData()
    formData.append('csvFile', selectedFile)

    try {
      const response = await axios.post(
        `${SERVER_DOMAIN}/uploadAndDownload`,
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
      saveAs(blob, EXCEL_FILE_NAME)
      setIsSuccess(true)
      setIsError(false)
      setIsLoading(false)
    } catch (error) {
      setIsError(true)
      setIsLoading(false)
      setIsSuccess(false)
      console.error('Error uploading and downloading file:', error)
    }
  }

  return (
    <div className='logo'>
      <p>
        Upload the tradebook from zerodha in csv format:{' '}
        <a referrerPolicy='no-referrer' target='_blank' href={TRADE_BOOK_URL}>
          Link
        </a>
      </p>
      <div className='input-wrapper'>
        <input
          type='file'
          accept='.csv'
          onChange={handleFileChange}
          className='custom-input'
          placeholder='Upload file'
        />
      </div>
      <button disabled={isButtonDisabled} onClick={handleUploadAndDownload}>
        {isLoading ? `Loading ...` : `Upload CSV and Download Excel`}
      </button>
      {isLoading && <CircularProgress color='secondary' />}
      {isSuccess && (
        <Alert severity='success'>
          <AlertTitle> Successfully Downloaded!</AlertTitle>
        </Alert>
      )}
      {isError && (
        <Alert severity='error'>
          <AlertTitle> An Error Occurred 🙁</AlertTitle>
          {errorMessage}
        </Alert>
      )}
    </div>
  )
}

export default Home
