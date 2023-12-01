import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  role?: string;
  email?: string;
  password: string;
  time: Date;
  phone?: string;
  subjects?: string[];
  fromClass?: number;
  toClass?: number;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 6,
  },
  role: {
    type: String,
  },
  email: {
    type: String,
    required: false,
    max: 128,
    min: 8,
  },
  password: {
    type: String,
    required: true,
    max: 128,
    min: 8,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  phone: {
    type: String,
  },
  subjects: {
    type: [String],
  },
  fromClass: {
    type: Number,
  },
  toClass: {
    type: Number,
  },
});

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
