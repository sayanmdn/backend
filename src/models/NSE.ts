import mongoose, { Schema, Document } from "mongoose";

export interface INSEStock {
  weekly?: boolean;
  segment?: string;
  name?: string;
  exchange?: string;
  expiry?: number;
  instrument_type?: string;
  asset_symbol?: string;
  underlying_symbol?: string;
  instrument_key?: string;
  lot_size?: number;
  freeze_quantity?: number;
  exchange_token?: string;
  minimum_lot?: number;
  asset_key?: string;
  underlying_key?: string;
  tick_size?: number;
  asset_type?: string;
  underlying_type?: string;
  trading_symbol?: string;
  strike_price?: number;
  security_type?: string;
}

const nseSchema: Schema<INSEStock> = new mongoose.Schema({
  weekly: { type: Boolean, required: false },
  segment: { type: String, required: false },
  name: { type: String, required: false },
  exchange: { type: String, required: false },
  expiry: { type: Number, required: false },
  instrument_type: { type: String, required: false },
  asset_symbol: { type: String, required: false },
  underlying_symbol: { type: String, required: false },
  instrument_key: { type: String, required: false },
  lot_size: { type: Number, required: false },
  freeze_quantity: { type: Number, required: false },
  exchange_token: { type: String, required: false },
  minimum_lot: { type: Number, required: false },
  asset_key: { type: String, required: false },
  underlying_key: { type: String, required: false },
  tick_size: { type: Number, required: false },
  asset_type: { type: String, required: false },
  underlying_type: { type: String, required: false },
  trading_symbol: { type: String, required: false },
  strike_price: { type: Number, required: false },
  security_type: { type: String, required: false },
});

const NSEModel = mongoose.model<INSEStock>("nse", nseSchema);
export default NSEModel;
