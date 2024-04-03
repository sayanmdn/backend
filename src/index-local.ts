import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connect, Connection, connection } from "mongoose";
import authRouter from "./routes/auth";
import postRoute from "./routes/private";
import teachersRouter from "./routes/teachers";
import studentRouter from "./routes/students";
import { DEFAULT_SERVER_RESPONSE } from "./constant";
import swaggerUi from "swagger-ui-express";
// import { swaggerSpec } from "./swagger";
const YAML = require("yamljs"); // This is for loading YAML file
const swaggerDocument = YAML.load("./swagger.yml");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const port = 8080;

app.use("/user", authRouter);
app.use("/post", postRoute);
app.use("/teachers", teachersRouter);
app.use("/students", studentRouter);

app.get("/", (_req, res) => {
  res.send(DEFAULT_SERVER_RESPONSE);
});

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// how to render swagger ui from swagger.yml file

const username: string | undefined = process.env.MONGO_USERNAME;
const mongo_password: string | undefined = process.env.MONGO_PASSWORD;

const uri: string = `mongodb+srv://${username}:${mongo_password}@backend-serverless.3e0kv62.mongodb.net/portfolio-db?retryWrites=true&w=majority`;

console.log("uri ", uri);

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
