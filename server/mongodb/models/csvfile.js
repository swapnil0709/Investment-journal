import mongoose from 'mongoose'

const csvFileSchema = new mongoose.Schema({
  name: String, // The name of the CSV file
  data: Buffer, // The binary data of the CSV file
  contentType: String, // Content type of the file (e.g., 'text/csv')
  createdDate: Date,
})

const CsvFile = mongoose.model('CsvFile', csvFileSchema)

export default CsvFile
