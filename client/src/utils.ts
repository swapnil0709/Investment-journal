import { JsonProps, StocksProps } from './type'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cleanExcelData = (array: any[]) => {
  const indexOfData = array.findIndex(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => data.__EMPTY === 'Symbol'
  )
  const [headers, ...stocksData] = array.slice(indexOfData)
  const updatedStocksData = stocksData.map((eachData: JsonProps) =>
    generateObject(headers, eachData)
  )
  return updatedStocksData
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateObject = (headers: any, stockData: any) => {
  // Create an empty object to store the result
  const result: { [key: string]: StocksProps } = {}

  // Iterate through the headers object and use its values as keys for the new object
  for (const key in headers) {
    const value = headers[key]
    result[value] = stockData[key] // You can set any default value here
  }
  return result
}
