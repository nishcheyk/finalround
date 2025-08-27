import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import routes from "./app/routes";
import notFound from "./app/common/middlewares/errorHandler";
import errorHandler from "./app/common/middlewares/errorHandler";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import cookieParser from "cookie-parser";
const app = express();
app.use(cookieParser());
const corsOptions = {
  origin: "http://localhost:5173", // frontend origin, not '*'
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Log all incoming requests (optional, useful for debugging)
app.use((req, res, next) => {
  console.log(`Received ${req.method} on ${req.originalUrl}`);
  next();
});

// API routes prefixed with /api
app.use("/api", routes);

// Swagger docs available at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 handler middleware - must be after all routes
app.use(notFound);

// Centralized error handling middleware must be last
app.use(errorHandler);

/**
 * Connects to MongoDB using provided URI.
 * Avoids multiple connections if already connected.
 * @param uri MongoDB connection string
 */
export async function connectDB(uri: string) {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri);
}

/**
 * Disconnects from MongoDB
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

// Start server and connect to MongoDB if not in test mode
if (process.env.NODE_ENV !== "test") {
  connectDB(process.env.MONGODB_URI!).then(() => {
    app.listen(3000, () =>
      console.log("Server running on port 3000. Swagger docs at /api-docs"),
    );
  });
}

export default app;
