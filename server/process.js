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
  logToFile,
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
  const uniqueSymbolsArray = [
    ...new Set(stocksArray.map((eachData) => eachData.Symbol)),
  ]
  const factTransactions = stocksArray.filter(
    (eachData) => eachData.Symbol === 'IONEXCHANG'
  )

  //* Processing transactions for each symbol and push the results to resultArray
  uniqueSymbolsArray.forEach((eachSymbol) => {
    const allTransactionsForSymbol = factTransactions.filter(
      //TODO: replace with stocksArray
      (eachData) => eachData.Symbol === eachSymbol
    )
    const cleanAllTransactionsForSymbol = removeFirstSellTransactions(
      allTransactionsForSymbol
    )

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
  })

  logToFile(resultArray, 'output.json')
}

const removeFirstSellTransactions = (allTransactionsForSymbol) => {
  // console.log(
  //   `AllTransactions found for symbol ${allTransactionsForSymbol.length}`
  // )
  const indexOfFirstBuyTransaction = allTransactionsForSymbol.findIndex(
    (eachTransaction) => eachTransaction['Trade Type'] === 'buy'
  )
  if (indexOfFirstBuyTransaction === -1) {
    return allTransactionsForSymbol
  }
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
        tmpTransactionsArray = [...tmpTransactionsArray, ...returnedData]
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
    console.log('some pending', [...allTransPerStock, tmpTransactionsArray])
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
    // return processSellBuyTransaction(transaction1, transaction2)
  }
}

const processBuySellTransaction = (transaction1, transaction2) => {
  const buyQty = transaction1.Qty
  const sellQty = transaction2.Qty

  if (buyQty === sellQty) {
    return handleFullSettlement(transaction1, transaction2)
  } else if (buyQty > sellQty) {
    const leftOverQty = sellQty - buyQty
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
      'Income Tax': isBuyTrade ? '' : '',
      'Net Realized Gain': isBuyTrade ? '' : '',
      'Net Realized %': isBuyTrade ? '' : '',
    }
    const settledObject = handleFullSettlement(settleBuyQty, transaction2)

    const unsettledObject = handleLeftOverQuantity(transaction1, leftOverQty)
    return [settledObject, unsettledObject]
  } else {
    // TODO: When Buy < Sell, we need to generate a complete record for buy-sell & some sell will be left we will show those sell amounts as well
  }
}

const handleLeftOverQuantity = (transaction1, leftOverQty) => {
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
  const unrealizedGainPer = getProfitPer(unrealizedGain, investedAmount)
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
    'Unrealized Gain %': unrealizedGainPer,
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
const processSellBuyTransaction = (transaction1, transaction2) => {
  // console.log(`Attention SELL BUY TRANSACTION FOUND!!!`)
}
