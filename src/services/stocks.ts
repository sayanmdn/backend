import axios from "axios";
import NSEModel from "../models/NSE";

// Define a type for the result structure
interface ProcessedStockResult {
  trading_symbol: string;
  delta200: number;
  delta50: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  } | null;
}

// List of stock symbols to filter from NSE data
const stockSymbols = [
  "3MINDIA",
  "ABB",
  "ACC",
  "AIAENG",
  "APLAPOLLO",
  "AUBANK",
  "ABBOTINDIA",
  "ADANIENSOL",
  "ADANIENT",
  "ADANIGREEN",
  "ADANIPORTS",
  "ADANIPOWER",
  "ATGL",
  "AWL",
  "ABCAPITAL",
  "ABFRL",
  "AJANTPHARM",
  "ALKEM",
  "AMBUJACEM",
  "APOLLOHOSP",
  "APOLLOTYRE",
  "ASHOKLEY",
  "ASIANPAINT",
  "ASTRAL",
  "AUROPHARMA",
  "DMART",
  "AXISBANK",
  "BSE",
  "BAJAJ-AUTO",
  "BAJFINANCE",
  "BAJAJFINSV",
  "BAJAJHLDNG",
  "BALKRISIND",
  "BANDHANBNK",
  "BANKBARODA",
  "BANKINDIA",
  "MAHABANK",
  "BAYERCROP",
  "BERGEPAINT",
  "BDL",
  "BEL",
  "BHARATFORG",
  "BHEL",
  "BPCL",
  "BHARTIARTL",
  "BHARTIHEXA",
  "BIOCON",
  "BOSCHLTD",
  "BRITANNIA",
  "CGPOWER",
  "CRISIL",
  "CANBK",
  "CARBORUNIV",
  "CHOLAFIN",
  "CIPLA",
  "COALINDIA",
  "COCHINSHIP",
  "COFORGE",
  "COLPAL",
  "CONCOR",
  "COROMANDEL",
  "CUMMINSIND",
  "DLF",
  "DABUR",
  "DALBHARAT",
  "DEEPAKNTR",
  "DELHIVERY",
  "DIVISLAB",
  "DIXON",
  "DRREDDY",
  "EICHERMOT",
  "EMAMILTD",
  "ENDURANCE",
  "ESCORTS",
  "EXIDEIND",
  "NYKAA",
  "FEDERALBNK",
  "FACT",
  "FORTIS",
  "GAIL",
  "GMRINFRA",
  "GICRE",
  "GLAND",
  "GLAXO",
  "MEDANTA",
  "GODREJCP",
  "GODREJIND",
  "GODREJPROP",
  "GRASIM",
  "GRINDWELL",
  "FLUOROCHEM",
  "GUJGASLTD",
  "HCLTECH",
  "HDFCAMC",
  "HDFCBANK",
  "HDFCLIFE",
  "HAVELLS",
  "HEROMOTOCO",
  "HINDALCO",
  "HAL",
  "HINDPETRO",
  "HINDUNILVR",
  "HINDZINC",
  "POWERINDIA",
  "HONAUT",
  "HUDCO",
  "ICICIBANK",
  "ICICIGI",
  "ICICIPRULI",
  "IDBI",
  "IDFCFIRSTB",
  "IRB",
  "ITC",
  "INDIANB",
  "INDHOTEL",
  "IOC",
  "IOB",
  "IRCTC",
  "IRFC",
  "IREDA",
  "IGL",
  "INDUSTOWER",
  "INDUSINDBK",
  "NAUKRI",
  "INFY",
  "INDIGO",
  "IPCALAB",
];

// Helper function to make API requests
const makeRequest = async (instrumentKey: string): Promise<any[]> => {
  try {
    const response = await axios.get(
      `https://api.upstox.com/v2/historical-candle/${instrumentKey}/day/2024-10-18/2023-10-18`,
      {
        headers: { Accept: "application/json" },
      },
    );
    return response.data.data.candles;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Function to calculate delta if below 200-day average
function calculateDeltaIfBelow200DayAvg(processed: { date: Date; price: number }[]): number {
  const sortedProcessed = processed.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (sortedProcessed.length >= 200) {
    const last200Days = sortedProcessed.slice(0, 200);
    const averagePrice = last200Days.reduce((sum, day) => sum + day.price, 0) / last200Days.length;
    const lastDayPrice = sortedProcessed[0].price;
    const delta = Math.abs(averagePrice - lastDayPrice);
    const percentageDelta = (delta / averagePrice) * 100;

    return lastDayPrice < averagePrice ? percentageDelta : -1;
  }
  return -1;
}

// Function to calculate delta if below 50-day average
function calculateDeltaIfBelow50DayAvg(processed: { date: Date; price: number }[]): number {
  const sortedProcessed = processed.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (sortedProcessed.length >= 50) {
    const last50Days = sortedProcessed.slice(0, 50);
    const averagePrice = last50Days.reduce((sum, day) => sum + day.price, 0) / last50Days.length;
    const lastDayPrice = sortedProcessed[0].price;
    const delta = Math.abs(averagePrice - lastDayPrice);
    const percentageDelta = (delta / averagePrice) * 100;

    return lastDayPrice < averagePrice ? percentageDelta : -1;
  }
  return -1;
}

// Function to calculate Exponential Moving Average (EMA)
function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  let emaArray = [prices[0]];

  for (let i = 1; i < prices.length; i++) {
    const ema = prices[i] * k + emaArray[i - 1] * (1 - k);
    emaArray.push(ema);
  }
  return emaArray;
}

// Function to calculate MACD
function calculateMACD(processed: { date: Date; price: number }[]) {
  const sortedProcessed = processed.sort((a, b) => b.date.getTime() - a.date.getTime());
  const prices = sortedProcessed.map((day) => day.price);

  if (prices.length >= 26) {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12.map((value, index) => value - ema26[index]);
    const signalLine = calculateEMA(macdLine.slice(ema26.length - ema12.length), 9);
    const macdHistogram = macdLine.map((value, index) => value - signalLine[index]);

    return {
      macdLine: macdLine[macdLine.length - 1],
      signalLine: signalLine[signalLine.length - 1],
      histogram: macdHistogram[macdHistogram.length - 1],
    };
  }
  return null;
}

// Function to process all filtered NSE data
async function processAllFilteredNSE() {
  const nseData = await NSEModel.find({ instrument_type: "EQ" });

  // Filter NSE data based on stock symbols and criteria
  const filteredNSE = nseData.filter((stock) => stockSymbols.includes(stock.trading_symbol));
  const results: ProcessedStockResult[] = [];

  for (const nseItem of filteredNSE) {
    try {
      const candles = await makeRequest(nseItem.instrument_key);
      const processed = candles.map((candle) => ({
        date: new Date(candle[0]),
        price: (candle[2] + candle[3]) / 2,
      }));

      const delta200 = calculateDeltaIfBelow200DayAvg(processed);
      const delta50 = calculateDeltaIfBelow50DayAvg(processed);
      const macd = calculateMACD(processed);

      if (delta200 > 0 && delta50 > 0 && delta50 < delta200 + 2) {
        results.push({
          trading_symbol: nseItem.trading_symbol,
          delta200,
          delta50,
          macd,
        });
      }
    } catch (error) {
      console.error(`Error processing ${nseItem.instrument_key}:`, error);
    }
  }

  return results.sort((a, b) => b.delta200 - a.delta200 || b.macd!.histogram - a.macd!.histogram);
}

// getProcessedStocks function to initiate the process
export async function getProcessedStocks(): Promise<ProcessedStockResult[]> {
  return processAllFilteredNSE();
}
