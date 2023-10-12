import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  time: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 6,
  },
  email: {
    type: String,
    required: true,
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
});

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
