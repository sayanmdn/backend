import express from "express";
import serverless from "serverless-http";
import { connect } from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import authRouter from "./routes/auth";
import postRoute from "./routes/private";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/user", authRouter);
app.use("/post", postRoute);

app.get("/", (req, res) => {
  res.send("Welcome! This is the portfolio backend v2");
});

const username: string | undefined = process.env.MONGO_USERNAME;
const mongo_password: string | undefined = process.env.MONGO_PASSWORD;

const uri: string = `mongodb+srv://${username}:${mongo_password}@backend-serverless.3e0kv62.mongodb.net/portfolio-db?retryWrites=true&w=majority`;

try {
  connect(uri);
} catch (error) {
  console.log("Error while connection Mongodb Atlas ", error);
}

module.exports.handler = serverless(app);
