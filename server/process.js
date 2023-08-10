import {
  getSum,
  getAvg,
  compareString,
  getStockParamValue,
  formatValue,
} from './utils.js'

export const generateStockObject = (
  tradesForSymbolPerDay,
  nseData,
  bseData,
  index
) => {
  const totalQuantity = getSum(tradesForSymbolPerDay, 'quantity')
  const price = getAvg(tradesForSymbolPerDay, 'price')
  const isBSETrade = tradesForSymbolPerDay.every(
    ({ exchange }) => exchange === 'BSE'
  )
  const isBuyTrade = tradesForSymbolPerDay.every(
    ({ trade_type }) => trade_type === 'buy'
  )
  const symbol = getStockParamValue(tradesForSymbolPerDay, 'symbol')
  const tradeDate = getStockParamValue(tradesForSymbolPerDay, 'trade_date')
  const exchangeData = isBSETrade ? bseData : nseData
  const ltp = getLTP(symbol, exchangeData, isBSETrade)
  const investedAmount = totalQuantity * price
  const unrealizedGain = (ltp - price) * totalQuantity
  const unrealizedGainPer = (unrealizedGain / investedAmount) * 100
  const stopLoss = 0.9 * price
  const gainsAtStopLoss = (stopLoss - price) * totalQuantity
  const SEBICharges = investedAmount / 1000000
  const stampCharges = 0.00015 * investedAmount
  const stt = investedAmount / 1000
  const exchangeCharges = isBSETrade
    ? 0.0000375 * investedAmount
    : 0.0000325 * investedAmount
  const gst = 0.18 * (SEBICharges + exchangeCharges)

  const stockObject = {
    'SNo.': index,
    Symbol: symbol,
    Qty: totalQuantity,
    'First Buy Date': isBuyTrade ? tradeDate : '',
    'Latest Buy Date': isBuyTrade ? tradeDate : '',
    'First Buy Price': isBuyTrade ? formatValue(price) : '',
    'Buy Price': isBuyTrade ? formatValue(price) : '',
    LTP: ltp,
    Exchange: isBSETrade ? 'BSE' : 'NSE',
    'Trade Type': isBuyTrade ? 'buy' : 'sell',
    'Invested Amount': isBuyTrade ? formatValue(investedAmount) : '',
    'Sell Price': isBuyTrade ? 0 : formatValue(price),
    'Sell date': isBuyTrade ? '' : tradeDate,
    'Realized Gain': isBuyTrade ? '' : '',
    'Unrealized Gain': isBuyTrade ? formatValue(unrealizedGain) : '',
    'Realized Gain %': isBuyTrade ? '' : '',
    'Unrealized Gain %': isBuyTrade ? formatValue(unrealizedGainPer) : '',
    'Stop Loss': isBuyTrade ? formatValue(stopLoss) : '',
    'Stop Loss % Away': isBuyTrade ? '10%' : '',
    'Gains at Stop Loss': isBuyTrade ? formatValue(gainsAtStopLoss) : '',
    Brokerage: 0,
    STT: formatValue(stt),
    'Exchange Charges': formatValue(exchangeCharges),
    'SEBI Charge': formatValue(SEBICharges),
    'Stamp charges': formatValue(stampCharges),
    GST: formatValue(gst),
    'Income Tax': isBuyTrade ? '' : '',
    'Net Realized Gain': isBuyTrade ? '' : '',
    'Net Realized %': isBuyTrade ? '' : '',
  }
  return stockObject
}

const getLTP = (symbol, exchangeData, isBSE) => {
  const foundRecord = exchangeData.find((eachData) =>
    isBSE
      ? compareString(eachData.TckrSymb, symbol)
      : compareString(eachData.SYMBOL, symbol)
  )

  if (foundRecord) {
    return isBSE ? Number(foundRecord.LastPric) : Number(foundRecord.LAST)
  }
}
