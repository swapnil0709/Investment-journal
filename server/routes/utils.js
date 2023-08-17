import multer from 'multer'

const storage = multer.memoryStorage() // Store files in memory
export const multerUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed.'))
    }
  },
})
