import mongoose, { Schema, Document } from "mongoose";

export interface IStock extends Document {
  date: Date;
  data: {
    trading_symbol: string;
    delta200: number;
    delta50: number;
    macd?: {
      macdLine: number;
      signalLine: number;
      histogram: number;
    };
  }[];
}

const newsSchema: Schema<IStock> = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  data: [
    {
      trading_symbol: {
        type: String,
        required: true,
      },
      delta200: {
        type: Number,
        required: true,
      },
      delta50: {
        type: Number,
        required: true,
      },
      macd: {
        macdLine: {
          type: Number,
          required: false,
        },
        signalLine: {
          type: Number,
          required: false,
        },
        histogram: {
          type: Number,
          required: false,
        },
      },
    },
  ],
});

const StocksModel = mongoose.model<IStock>("stocks", newsSchema);
export default StocksModel;
