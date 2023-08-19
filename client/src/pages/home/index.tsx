import axios from 'axios'
import React, { ChangeEvent, useState } from 'react'
import { saveAs } from 'file-saver'
import { EXCEL_FILE_NAME, SERVER_DOMAIN, TRADE_BOOK_URL } from '../../const'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Button from '@mui/joy/Button'
import FileDownload from '@mui/icons-material/FileDownload'
import ReportIcon from '@mui/icons-material/Report'
import CustomAlert from '../../components/Alert'

const Home: React.FC = () => {
  //* States & constants
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const isButtonDisabled = isLoading || !selectedFile
  axios.defaults.withCredentials = true

  // * Functions
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setSelectedFile(selectedFile)
    }
  }

  const handleAlertClose = () => {
    if (isSuccess) {
      setIsSuccess(false)
    } else {
      setIsError(false)
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
      setErrorMessage('Error downloading file')
      console.error('Error downloading file:', error)
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
      <Button
        disabled={isButtonDisabled}
        loading={isLoading}
        endDecorator={<FileDownload />}
        variant='solid'
        onClick={handleUploadAndDownload}
      >
        Download Journal
      </Button>
      <CustomAlert
        closeIcon={<CloseRoundedIcon />}
        color={'success'}
        handleClose={handleAlertClose}
        icon={<CheckCircleIcon />}
        message='Downloaded Successfully!'
        showAlert={isSuccess}
        title='Success'
      />
      <CustomAlert
        closeIcon={<CloseRoundedIcon />}
        color={'danger'}
        handleClose={handleAlertClose}
        icon={<ReportIcon />}
        message={errorMessage}
        showAlert={isError}
        title='Error'
      />
    </div>
  )
}

export default Home
