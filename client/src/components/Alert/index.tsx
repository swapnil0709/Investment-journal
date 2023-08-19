import { Alert, IconButton, Typography } from '@mui/joy'
import { ReactNode } from 'react'

type CustomAlertProps = {
  showAlert: boolean
  message: string
  title: string
  color: 'success' | 'danger'
  handleClose: () => void
  icon: ReactNode
  closeIcon: ReactNode
}
const CustomAlert = ({
  showAlert = false,
  message = '',
  title = '',
  color = 'success',
  handleClose = () => undefined,
  icon = <></>,
  closeIcon = <></>,
}: CustomAlertProps) => {
  if (!showAlert) {
    return null
  }
  return (
    <Alert
      key={title}
      sx={{ alignItems: 'flex-start' }}
      startDecorator={icon}
      variant='soft'
      color={color}
      endDecorator={
        <IconButton variant='soft' color={color} onClick={handleClose}>
          {closeIcon}
        </IconButton>
      }
    >
      <div>
        <div>{title}</div>
        <Typography level='body-sm' color={color}>
          {message}
        </Typography>
      </div>
    </Alert>
  )
}

export default CustomAlert
