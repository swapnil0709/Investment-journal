import express from 'express'
import { getApp, uploadAndDownload } from '../controllers/app.controller.js'
import { multerUpload } from './utils.js'

const router = express.Router()

router.route('/').get(getApp)

// Define a POST route for file upload
router
  .route('/uploadAndDownload', multerUpload.single('csvFile'))
  .post(uploadAndDownload)

export default router
