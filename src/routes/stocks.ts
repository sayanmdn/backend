import { Request, Response, Router } from "express";
import StocksModel from "../models/Stocks";
import { getProcessedStocks } from "../services/stocks";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  // fetch last 5 days stocks data
  const stocks = await StocksModel.find({}).sort({ date: -1 }).limit(5);

  // check if the lastest data is of todays
  const today = new Date();
  if (stocks.length > 0 && stocks[0].date.getDate() === today.getDate()) {
    // send the data
    return res.send(stocks);
  }
  const processedStocks = await getProcessedStocks();
  const newStocks = new StocksModel({
    date: today,
    data: processedStocks,
  });
  await newStocks.save();
  res.send(newStocks);
});

export default router;
