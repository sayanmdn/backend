import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connect, Connection, connection } from "mongoose";
import authRouter from "./routes/auth";
import postRoute from "./routes/private";
import teachersRouter from "./routes/teachers";
import studentRouter from "./routes/students";
import stockRouter from "./routes/stocks";
import { DEFAULT_SERVER_RESPONSE } from "./constant";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const port = 8080;

app.use("/user", authRouter);
app.use("/post", postRoute);
app.use("/teachers", teachersRouter);
app.use("/students", studentRouter);
app.use("/stocks", stockRouter);

app.get("/", (_req, res) => {
  res.send(DEFAULT_SERVER_RESPONSE);
});

const username: string | undefined = process.env.MONGO_USERNAME;
const mongo_password: string | undefined = process.env.MONGO_PASSWORD;

const uri: string = `mongodb+srv://${username}:${mongo_password}@backend-serverless.3e0kv62.mongodb.net/portfolio-db?retryWrites=true&w=majority`;

console.log("uri ", uri);

// import aws from "aws-sdk";

// aws.config.update({
//   accessKeyId: process.env.AWS_ACCESSKEY,
//   secretAccessKey: process.env.AWS_SECRET_ACCESSKEY,
//   region: "ap-south-1",
// });
// const sns = new aws.SNS();

// async function sendSMS() {
//   const params = {
//     Message: "Oiii...... from:7001137041", // A sample text message
//     PhoneNumber: "+917001137041", // Recipient's phone number
//   };
//   try {
//     const data = await sns.publish(params).promise();
//     console.log("SMS sent successfully:", params, data);
//   } catch (err) {
//     console.error("Error sending SMS:", err);
//   }
// }

// // Schedule SMS sending every 10 minutes
// cron.schedule("* * * * *", () => {
//   console.log("Running scheduled SMS task every minute");
//   sendSMS();
// });

try {
  connect(uri);

  const dbConnection: Connection = connection;
  dbConnection.once("open", function () {
    console.log("MongoDB database connection established successfully");
  });
} catch (error) {
  console.log("Error while connection Mongodb Atlas ", error);
}

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

// write a cron to send sms every 10 minutes
