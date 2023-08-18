import express from 'express'
import { getApp, uploadAndDownload } from '../controllers/app.controller.js'
// import { multerUpload } from './utils.js'
import multer from 'multer'

const storage = multer.memoryStorage() // Store files in memory
export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed.'))
    }
  },
})

const router = express.Router()

router.route('/').get(getApp)

// Define a POST route for file upload
// router
//   .route('/uploadAndDownload', upload.single('csvFile'))
//   .post(uploadAndDownload)

export default router
