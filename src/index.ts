import express from "express";
import serverless from "serverless-http";
import { connect } from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth";
import postRoute from "./routes/private";
import teachersRouter from "./routes/teachers";
import studentRouter from "./routes/students";
import stockRouter from "./routes/stocks";
import { DEFAULT_SERVER_RESPONSE } from "./constant";

dotenv.config();

const app = express();

// Enhanced CORS configuration for Lambda
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

app.use(express.json());

// Global error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: {
      hasJwtSecret: !!process.env.SECRET_JWT_TOKEN,
      hasMongoUsername: !!process.env.MONGO_USERNAME,
      hasMongoPassword: !!process.env.MONGO_PASSWORD
    }
  });
});

app.use("/user", authRouter);
app.use("/post", postRoute);
app.use("/teachers", teachersRouter);
app.use("/students", studentRouter);
app.use("/stocks", stockRouter);

app.get("/", (_req, res) => {
  res.send(DEFAULT_SERVER_RESPONSE);
});

// MongoDB connection with better error handling
let isMongoConnected = false;

const connectToMongoDB = async () => {
  if (isMongoConnected) return;
  
  try {
    const username = process.env.MONGO_USERNAME;
    const mongo_password = process.env.MONGO_PASSWORD;
    
    if (!username || !mongo_password) {
      console.error("Missing MongoDB credentials in environment variables");
      return;
    }

    const uri = `mongodb+srv://${username}:${mongo_password}@backend-serverless.3e0kv62.mongodb.net/portfolio-db?retryWrites=true&w=majority`;
    
    await connect(uri);
    isMongoConnected = true;
    console.log("Successfully connected to MongoDB Atlas");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    // Don't throw error - allow app to continue without DB for now
  }
};

// Initialize MongoDB connection (non-blocking)
connectToMongoDB().catch(err => console.error("MongoDB connection failed:", err));

// Configure serverless-http with proper options for API Gateway
const serverlessHandler = serverless(app, {
  binary: false,
  provider: 'aws'
});

module.exports.handler = async (event: any, context: any) => {
  // Set context options for better Lambda performance
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    const result: any = await serverlessHandler(event, context);
    
    // Don't add duplicate CORS headers - let Express handle CORS
    // The duplicate headers were causing browser CORS issues
    
    return result;
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
