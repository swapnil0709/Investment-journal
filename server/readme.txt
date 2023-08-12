/*
SNo. -> yes
Stock symbol -> yes
Qty -> yes
First Buy Date -> yes
Buy Price -> yes
Buy Date -> yes
LTP -> Last traded price
Invested Amount -> yes, qty * buy price 
Sell Price -> yes
Realized Gain -> if trade type = sell then (sellprice - curr price) * qty
Unrealized Gain -> if trade type = buy then (buy price - curr price) * qty
Realized Gain % -> (Realized gain / invested amount) * 100
Unrealized Gain % -> (Unrealized gain / invested amount) * 100

Stop Loss: 0.9 * LTP (Last traded price)
Stop Loss % Away (Let us take 10% SL) -> 10%
Gains at Stop Loss: (Stop Loss - Buy Price) * qty

Charges :
Brokerage -> 0
STT -> On each buy/sell 0.1% = (Invested Amount) / 1000 
Exchange Charges: (NSE 0.00325% of invested amount) (BSE 0.00375% of invested amount)
SEBI Charge -> Invested amount / 10 lakh
Stamp charges -> 0.015% or 1500 / cr
GST -> 18% of (Brokerage + SEBI + Exchange charges)

Income Tax: 
If trade type = sell, 10% on profit if > 1year else 15%

Net Realized Gain : Buy -> Realized Gain - charges - Income tax
Net Realized % : (Realized gain - charges - Income tax / invested amount) * 100
*/

// Total Realized, Unrealized & Net realized gains.

/* Metrics:
Analysis of Realized Profits:

Realized Profits -> Total Realized
Capitals on which profit has been realized -> Sum of all invested amount where trade_type = sell
Realized Profit % -> (Realized Profits / Capitals on which profit has been realized) * 100
No. of trades completed -> Count of rows where trade-type = sell
Profitable % -> Count of Realized Gains > 0 / No. of trades completed
Loss % -> 1 - Profitable %
Average Gain -> Avg of realized gain % > 0
Average Loss -> Avg of realized gain % < 0
Gain:Loss -> (Avg Gain / Avg Loss) * -1
Multiple Ratio -> (Profitable % / Loss %) * Gain:Loss

Analysis of Unrealized Profits:

Unrealized Profits -> Total Unrealized
Capitals on which profit has been unrealized -> Sum of all invested amount where trade_type = buy
Unrealized Profit % -> (Unrealized Profits / Capitals on which profit has been unrealized) * 100
No. of trades completed -> Count of rows where trade-type = buy
Profitable % -> Count of Unrealized Gains > 0 / No. of trades completed
Loss % -> 1 - Profitable %
Average Gain -> Avg of realized gain % > 0
Average Loss -> Avg of realized gain % < 0
Gain:Loss -> (Avg Gain / Avg Loss) * -1
Multiple Ratio -> (Profitable % / Loss %) * Gain:Loss
*/

# SCENARIOS:

1. Only buy
2. Only sell
3. Buy more (Pyramid)
4. Sell Partial

# LOGIC:

1.Inputs req: NSE, BSE dump & Tradebook

2. Consolidate current data: 
- First filter unique dates in ascending order.
- Now for each date : Filter unique symbols
- Now for that date & each symbol filter records.
- Now for each record loop and create a buy & sell objects.
- Now create a combined buy-sell object: For each symbol buy, look for a sell symbol.
- Now check qty. if qty buy = qty sell, then create a single object.
- If qty buy > qty sell, create 2 objects, one with ...


# Pyramiding Scenario:
Latest Buy Date = Buy Date of last record
Buy Price = Avg of all buy price
Invested Amount = Sum of all Invested amount

Charges = Sum of all charges

Recalculate: Unrealized gain, %, SL, Gains at SL