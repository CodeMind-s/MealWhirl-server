require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const { initKafkaProducer, initKafkaConsumer } = require("./services/kafkaService");

const app = express();
const PORT = process.env.CART_PORT || 5007;

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send('Cart Service is healthy');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke in the Cart Service!');
});

// Startup function
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("MongoDB connected successfully");
    
    // Initialize Kafka Producer
    await initKafkaProducer();
    console.log("Kafka Producer initialized");
    
    // Initialize Kafka Consumer
    await initKafkaConsumer();
    logger.info("Kafka Consumer initialized");
    
    // Start Express server for health checks
    app.listen(PORT, () => {
      logger.info(`Cart Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Cart Service:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();