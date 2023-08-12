import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRouter from "./routes/auth";
import postRoute from "./routes/private";
import { connect, Connection, connection } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 8080;

app.use("/user", authRouter);
app.use("/post", postRoute);

app.get("/", (req, res) => {
    console.log(JSON.stringify(req.body));
    res.send("Welcome! This is the portfolio backend v2");
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

const username: string | undefined = process.env.MONGO_USERNAME;
const mongo_password: string | undefined = process.env.MONGO_PASSWORD;

const uri: string = `mongodb+srv://${username}:${mongo_password}@cluster0.9l02g.gcp.mongodb.net/portfolio-db?retryWrites=true&w=majority`;

try {
    connect(uri);
    console.log("Connected.")
} catch (error) {
    console.log("Could not connect");
    console.log(error);
}

const dbConnection: Connection = connection;
dbConnection.once("open", function () {
    console.log("MongoDB database connection established successfully");
});
