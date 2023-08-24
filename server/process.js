import {
  getSum,
  getAvg,
  compareString,
  getStockParamValue,
  formatValue,
  dateDifferenceGreaterThan365,
  getIncomeTax,
  getCharges,
  getInvestedAmount,
  getProfit,
  getProfitPer,
  getStopLossAmount,
  getStopLossPrice,
  getMetricsData,
  getTotalGain,
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
    isSettled: false,
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

//* This should return an array of stock objects - final data
export const combineTransactions = (stocksArray) => {
  const resultArray = []
  const invalidTransactionsArray = []
  const uniqueSymbolsArray = [
    ...new Set(stocksArray.map((eachData) => eachData.Symbol)),
  ]
  //! DEBUGGER FOR STOCK - Uncomment & replace the name of the stock for debugging purposes
  // const debugStock = stocksArray.filter(
  //   (eachData) => eachData.Symbol === 'PREMEXPLQ'
  // )

  //* Processing transactions for each symbol and push the results to resultArray
  uniqueSymbolsArray.forEach((eachSymbol) => {
    const allTransactionsForSymbol = stocksArray.filter(
      //! DEBUGGER FOR STOCK - Replace stocksArray with debugStock
      (eachData) => eachData.Symbol === eachSymbol
    )
    // console.log(allTransactionsForSymbol)
    const filteredTransactionsForSymbol = removeInvalidTransactions(
      allTransactionsForSymbol,
      invalidTransactionsArray
    )

    if (filteredTransactionsForSymbol !== -1) {
      const cleanAllTransactionsForSymbol = removeFirstSellTransactions(
        filteredTransactionsForSymbol,
        invalidTransactionsArray
      )
      if (cleanAllTransactionsForSymbol !== -1) {
        //! Check if in case received an array iterate and push to result Array
        const processedTransaction = processAllTransactions(
          cleanAllTransactionsForSymbol
        )

        if (Array.isArray(processedTransaction)) {
          processedTransaction.forEach((transaction) =>
            resultArray.push(transaction)
          )
        } else {
          resultArray.push(processedTransaction)
        }
      }
    }
  })
  return [resultArray, invalidTransactionsArray]
}

const removeInvalidTransactions = (
  allTransactionsForSymbol,
  invalidTransactionsArray
) => {
  const buyTransactions = allTransactionsForSymbol.filter(
    (eachTransaction) => eachTransaction['Trade Type'] === 'buy'
  )
  const sellTransactions = allTransactionsForSymbol.filter(
    (eachTransaction) => eachTransaction['Trade Type'] === 'sell'
  )
  const totalBuyQty = getSum(buyTransactions, 'Qty')
  const totalSellQty = getSum(sellTransactions, 'Qty')
  if (totalBuyQty < totalSellQty) {
    allTransactionsForSymbol.forEach((eachTransaction) =>
      invalidTransactionsArray.push(eachTransaction)
    )
    return -1
  }
  return allTransactionsForSymbol
}

const removeFirstSellTransactions = (
  allTransactionsForSymbol,
  invalidTransactionsArray
) => {
  const indexOfFirstBuyTransaction = allTransactionsForSymbol.findIndex(
    (eachTransaction) => eachTransaction['Trade Type'] === 'buy'
  )
  if (indexOfFirstBuyTransaction === -1) {
    invalidTransactionsArray.push(allTransactionsForSymbol)
    return -1
  }
  const invalidSellTransactions = allTransactionsForSymbol.slice(
    0,
    indexOfFirstBuyTransaction
  )
  invalidSellTransactions.forEach((eachTransac) =>
    invalidTransactionsArray.push(eachTransac)
  )
  // console.log(`indexOfFirstBuy is ${indexOfFirstBuyTransaction}`)
  return allTransactionsForSymbol.slice(indexOfFirstBuyTransaction)
}

//* After processing all records for a stock, this should return me an array of transactions or a single transaction
const processAllTransactions = (transactionsArray) => {
  const allTransPerStock = []
  // logToFile(transactionsArray, 'logFile.json')
  if (transactionsArray.length <= 1) {
    if (transactionsArray.length < 1) {
      // console.log('ATTENTION: ARRAY HAS 0 RECORDS')
    }
    return transactionsArray
  }
  let tmpTransactionsArray = transactionsArray[0]

  for (let i = 0; i < transactionsArray.length - 1; i++) {
    const returnedData = processTwoTransactions(
      tmpTransactionsArray,
      transactionsArray[i + 1]
    )
    if (returnedData !== -1) {
      if (Array.isArray(returnedData)) {
        const [settledObject, unsettledObject] = returnedData
        allTransPerStock.push(settledObject)
        tmpTransactionsArray = unsettledObject
      } else {
        if (returnedData.isSettled) {
          allTransPerStock.push(returnedData)
          tmpTransactionsArray = transactionsArray[i + 1]
        } else {
          tmpTransactionsArray = returnedData
        }
      }
    } else {
      tmpTransactionsArray = transactionsArray[i + 1]
    }
  }

  if (tmpTransactionsArray['Trade Type'] === 'sell') {
    return allTransPerStock
  } else {
    return [...allTransPerStock, tmpTransactionsArray]
  }
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

const processAllSellTransaction = (transaction1, transaction2) => {
  // console.log(`Attention SELL SELL TRANSACTION FOUND!!!`)
}
const processAllBuySellTransaction = (transaction1, transaction2) => {
  if (
    transaction1['Trade Type'] === 'buy' &&
    transaction2['Trade Type'] === 'sell'
  ) {
    return processBuySellTransaction(transaction1, transaction2)
  } else if (
    transaction1['Trade Type'] === 'sell' &&
    transaction2['Trade Type'] === 'buy'
  ) {
    return -1
  }
}

const processBuySellTransaction = (transaction1, transaction2) => {
  const buyQty = transaction1.Qty
  const sellQty = transaction2.Qty

  if (buyQty === sellQty) {
    return handleFullSettlement(transaction1, transaction2)
  } else if (buyQty > sellQty) {
    const leftOverQty = buyQty - sellQty
    const investedAmount = formatValue(sellQty * transaction1['Buy Price'])
    const unrealizedGain = formatValue(
      (transaction1.LTP - transaction1['Buy Price']) * sellQty
    )
    const unrealizedGainPer = formatValue(
      (unrealizedGain / investedAmount) * 100
    )
    const stopLoss = 0.9 * transaction1['Buy Price']
    const lossAtStopLoss = (stopLoss - transaction1['Buy Price']) * sellQty
    const exchange = transaction1.Exchange
    const settleBuyQty = {
      ...transaction1,
      Qty: sellQty,
      'Invested Amount': investedAmount,
      'Unrealized Gain': unrealizedGain,
      'Unrealized Gain %': `${formatValue(unrealizedGainPer)}%`,
      SL: formatValue(stopLoss),
      'SL %': '10%',
      'Loss at SL': formatValue(lossAtStopLoss),
      STT: getCharges(investedAmount, exchange).stt,
      'Exchange Charges': getCharges(investedAmount, exchange).exchangeCharges,
      'SEBI Charge': getCharges(investedAmount, exchange).SEBICharges,
      'Stamp charges': getCharges(investedAmount, exchange).stampCharges,
      GST: getCharges(investedAmount, exchange).gst,
      'Income Tax': '',
      'Net Realized Gain': '',
      'Net Realized %': '',
    }
    const settledObject = handleFullSettlement(settleBuyQty, transaction2)

    const unsettledObject = handleLeftOverBuyQty(transaction1, leftOverQty)
    return [settledObject, unsettledObject]
  } else {
    const leftOverQty = sellQty - buyQty
    const exchange = transaction2.Exchange
    const sellPrice = transaction2['Sell Price']
    const sellDate = transaction2['Sell date']
    const sellValue = buyQty * sellPrice

    const settleSellQty = {
      ...transaction2,
      isSettled: false,
      Qty: buyQty,
      'Sell Price': sellPrice,
      'Sell date': sellDate,
      STT: getCharges(sellValue, exchange).stt,
      'Exchange Charges': getCharges(sellValue, exchange).exchangeCharges,
      'SEBI Charge': getCharges(sellValue, exchange).SEBICharges,
      'Stamp charges': getCharges(sellValue, exchange).stampCharges,
      GST: getCharges(sellValue, exchange).gst,
    }
    const settledObject = handleFullSettlement(transaction1, settleSellQty)
    const unsettledObject = handleLeftOverSellQty(transaction2, leftOverQty)
    return [settledObject, unsettledObject]
  }
}

const handleLeftOverSellQty = (transaction2, leftOverQty) => {
  const symbol = transaction2.Symbol
  const sellPrice = transaction2['Sell Price']
  const sellDate = transaction2['Sell date']
  const sellValue = leftOverQty * sellPrice
  const exchange = transaction2.Exchange
  return {
    ...transaction2,
    isSettled: false,
    Symbol: symbol,
    Qty: leftOverQty,
    'Sell Price': sellPrice,
    'Sell date': sellDate,
    STT: getCharges(sellValue, exchange).stt,
    'Exchange Charges': getCharges(sellValue, exchange).exchangeCharges,
    'SEBI Charge': getCharges(sellValue, exchange).SEBICharges,
    'Stamp charges': getCharges(sellValue, exchange).stampCharges,
    GST: getCharges(sellValue, exchange).gst,
  }
}

const handleLeftOverBuyQty = (transaction1, leftOverQty) => {
  const investedAmount = getInvestedAmount(
    leftOverQty,
    transaction1['Buy Price']
  )
  const unrealizedGain = getProfit(
    transaction1.LTP,
    transaction1['Buy Price'],
    leftOverQty
  )
  const buyPrice = transaction1['Buy Price']
  const stopLoss = getStopLossPrice(buyPrice)
  const unrealizedGainPer = formatValue((unrealizedGain / investedAmount) * 100)
  const exchange = transaction1.Exchange
  return {
    ...transaction1,
    Qty: leftOverQty,
    'Invested Amount': investedAmount,
    'Sell Price': '',
    'Sell date': '',
    'Realized Gain': '',
    'Unrealized Gain': unrealizedGain,
    'Realized Gain %': '',
    'Unrealized Gain %': `${unrealizedGainPer}%`,
    SL: stopLoss,
    'SL %': '10%',
    'Loss at SL': getStopLossAmount(stopLoss, buyPrice, leftOverQty),
    STT: getCharges(investedAmount, exchange).stt,
    'Exchange Charges': getCharges(investedAmount, exchange).exchangeCharges,
    'SEBI Charge': getCharges(investedAmount, exchange).SEBICharges,
    'Stamp charges': getCharges(investedAmount, exchange).stampCharges,
    GST: getCharges(investedAmount, exchange).gst,
    'Income Tax': '',
    'Net Realized Gain': '',
    'Net Realized %': '',
  }
}

const handleFullSettlement = (transaction1, transaction2) => {
  const combinedArray = [transaction1, transaction2]
  const sellPrice = transaction2['Sell Price']
  const buyPrice = transaction1['Buy Price']
  const investedAmount = transaction1['Invested Amount']
  const buyDate = transaction1['Latest Buy Date']
  const sellDate = transaction2['Sell date']
  const realizedGain = formatValue((sellPrice - buyPrice) * transaction1.Qty)
  const realizedGainPer = formatValue((realizedGain / investedAmount) * 100)
  const stt = formatValue(getSum(combinedArray, 'STT'))
  const exchCharges = formatValue(getSum(combinedArray, 'Exchange Charges'))
  const sebiCharges = formatValue(getSum(combinedArray, 'SEBI Charge'))
  const stampCharges = formatValue(getSum(combinedArray, 'Stamp charges'))
  const gst = formatValue(getSum(combinedArray, 'GST'))
  const incomeTax = getIncomeTax(
    dateDifferenceGreaterThan365(buyDate, sellDate),
    realizedGain
  )

  const totalCharges =
    stt + exchCharges + sebiCharges + stampCharges + gst + incomeTax
  const netRealizedGain = formatValue(realizedGain - totalCharges)
  const netRealizedPer = formatValue((netRealizedGain / investedAmount) * 100)
  return {
    ...transaction1,
    'Trade Type': 'sell',
    'Invested Amount': investedAmount,
    'Sell Price': sellPrice,
    'Sell date': sellDate,
    'Realized Gain': realizedGain,
    'Unrealized Gain': '',
    'Realized Gain %': `${realizedGainPer}%`,
    'Unrealized Gain %': '',
    SL: '',
    'SL %': '',
    'Loss at SL': '',
    Brokerage: 0,
    STT: stt,
    'Exchange Charges': exchCharges,
    'SEBI Charge': sebiCharges,
    'Stamp charges': stampCharges,
    GST: gst,
    'Income Tax': incomeTax,
    'Net Realized Gain': netRealizedGain,
    'Net Realized %': `${netRealizedPer}%`,
    isSettled: true,
  }
}

export const generateTotalObject = (resultArray) => {
  const allBuyTrades = resultArray.filter(
    (eachRecord) => eachRecord['Trade Type'] === 'buy'
  )
  const allSellTrades = resultArray.filter(
    (eachRecord) => eachRecord['Trade Type'] === 'sell'
  )

  const totalInvestedAmount = formatValue(
    getSum(allBuyTrades, 'Invested Amount')
  )
  const totalRealizedGain = getTotalGain(resultArray, 'Realized Gain')
  const totalUnrealizedGain = getTotalGain(resultArray, 'Unrealized Gain')

  const totalNetRealizedGain = formatValue(
    getSum(resultArray, 'Net Realized Gain')
  )

  const totalSTT = formatValue(getSum(resultArray, 'STT'))
  const totalExCharges = formatValue(getSum(resultArray, 'Exchange Charges'))
  const totalSEBICharges = formatValue(getSum(resultArray, 'SEBI Charge'))
  const totalGst = formatValue(getSum(resultArray, 'GST'))
  const totalStampCharges = formatValue(getSum(resultArray, 'Stamp charges'))
  const totalIncomeTax = formatValue(getSum(resultArray, 'Income Tax'))
  const realizedMetrics = getMetricsData(
    allSellTrades,
    totalRealizedGain,
    'Realized Gain'
  )
  const unrealizedMetrics = getMetricsData(
    allBuyTrades,
    totalUnrealizedGain,
    'Unrealized Gain'
  )
  return {
    Symbol: 'TOTAL',
    'Invested Amount': totalInvestedAmount,
    'Realized Gain': totalRealizedGain,
    'Unrealized Gain': totalUnrealizedGain,
    STT: totalSTT,
    'Exchange Charges': totalExCharges,
    'SEBI Charge': totalSEBICharges,
    'Stamp charges': totalStampCharges,
    GST: totalGst,
    'Income Tax': totalIncomeTax,
    'Net Realized Gain': totalNetRealizedGain,
    realizedMetrics,
    unrealizedMetrics,
  }
}
