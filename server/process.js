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
  bseData
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
  const exchange = isBSETrade ? 'BSE' : 'NSE'
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
  const chartLink = `https://www.tradingview.com/chart/?symbol=${exchange}%3A${symbol}`
  const stockObject = {
    Symbol: symbol,
    Qty: totalQuantity,
    'Chart Link': chartLink,
    'First Buy Date': isBuyTrade ? tradeDate : '',
    'Latest Buy Date': isBuyTrade ? tradeDate : '',
    'First Buy Price': isBuyTrade ? formatValue(price) : '',
    'Buy Price': isBuyTrade ? formatValue(price) : '',
    LTP: ltp,
    Exchange: exchange,
    'Trade Type': isBuyTrade ? 'buy' : 'sell',
    'Invested Amount': isBuyTrade ? formatValue(investedAmount) : '',
    'Sell Price': isBuyTrade ? '' : formatValue(price),
    'Sell date': isBuyTrade ? '' : tradeDate,
    'Realized Gain': isBuyTrade ? '' : '',
    'Unrealized Gain': isBuyTrade ? formatValue(unrealizedGain) : '',
    'Realized Gain %': isBuyTrade ? '' : '',
    'Unrealized Gain %': isBuyTrade ? `${formatValue(unrealizedGainPer)}%` : '',
    SL: isBuyTrade ? formatValue(stopLoss) : '',
    'SL %': isBuyTrade ? '10%' : '',
    'Loss at SL': isBuyTrade ? formatValue(gainsAtStopLoss) : '',
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

export const combineTransactions = (stocksArray) => {
  const uniqueSymbolsArray = [
    ...new Set(stocksArray.map((eachData) => eachData.Symbol)),
  ]
  const resultArray = []
  console.log(`Total transactions are ${stocksArray.length}`)
  console.log(`Total unique symbols are ${uniqueSymbolsArray.length}`)

  uniqueSymbolsArray.forEach((eachSymbol, index) => {
    if (index === 0) {
      console.log(`Transaction for ${eachSymbol}`)
      const allTransactionsForSymbol = stocksArray.filter(
        (eachData) => eachData.Symbol === eachSymbol
      )
      console.log(
        `Multiple Buy Transactions found for ${eachSymbol} are ${allTransactionsForSymbol.length}`
      )
      const processedTransaction = processAllTransactions(
        allTransactionsForSymbol
      )
      resultArray.push(processedTransaction)
      console.log(resultArray)
    }
  })
}

const processAllTransactions = (transactionsArray) => {
  if (transactionsArray.length <= 1) {
    return transactionsArray
  }
  let tmpTransactionsArray = transactionsArray[0]

  for (let i = 0; i < transactionsArray.length - 1; i++) {
    tmpTransactionsArray = processTwoTransactions(
      tmpTransactionsArray,
      transactionsArray[i + 1]
    )
  }
  return tmpTransactionsArray
}

const processTwoTransactions = (transaction1, transaction2) => {
  if (
    transaction1['Trade Type'] === 'buy' &&
    transaction2['Trade Type'] === 'buy'
  ) {
    return processAllBuyTransaction(transaction1, transaction2)
  } else if (transaction1['Trade Type'] === 'sell' && transaction2 === 'sell') {
    return processAllSellTransaction(transaction1, transaction2)
  } else {
    return processAllBuySellTransaction(transaction1, transaction2)
  }
}

const processAllBuyTransaction = (transaction1, transaction2) => {
  const combinedArray = [transaction1, transaction2]
  const ltp = transaction2.LTP
  const totalQty = getSum(combinedArray, 'Qty')
  const totalInvestedAmount = formatValue(
    getSum(combinedArray, 'Invested Amount')
  )
  const avgBuyPrice = formatValue(totalInvestedAmount / totalQty)
  const totalSTT = formatValue(getSum(combinedArray, 'STT'))
  const totalExCharges = formatValue(getSum(combinedArray, 'Exchange Charges'))
  const totalSEBICharges = formatValue(getSum(combinedArray, 'SEBI Charge'))
  const totalStampCharges = formatValue(getSum(combinedArray, 'Stamp charges'))
  const totalGst = formatValue(getSum(combinedArray, 'GST'))
  const unrealizedGain = formatValue((ltp - avgBuyPrice) * totalQty)
  const unrealizedGainPer = formatValue(
    (unrealizedGain / totalInvestedAmount) * 100
  )
  const stopLoss = formatValue(0.9 * avgBuyPrice)
  const lossAtSL = formatValue((stopLoss - avgBuyPrice) * totalQty)
  return {
    ...transaction1,
    Qty: totalQty,
    'Latest Buy Date': transaction2['Latest Buy Date'],
    'Buy Price': avgBuyPrice,
    'Invested Amount': totalInvestedAmount,
    'Unrealized Gain': unrealizedGain,
    'Unrealized Gain %': `${unrealizedGainPer}%`,
    SL: stopLoss,
    'Loss at SL': lossAtSL,
    STT: totalSTT,
    'Exchange Charges': totalExCharges,
    'SEBI Charge': totalSEBICharges,
    'Stamp charges': totalStampCharges,
    GST: totalGst,
  }
}
const processAllSellTransaction = (transaction1, transaction2) => {}
const processAllBuySellTransaction = (transaction1, transaction2) => {}
