require("dotenv").config();
const express = require("express");
const logger = require('./utils/logger');
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { initKafkaProducer, initKafkaConsumer } = require("./services/kafkaService");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);

app.get("/api/v1", (req, res) => {
  res.send("Connected to Mealwhirl API Gateway");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke in the API Gateway!');
});

// Start server
const startServer = async () => {
  try {
    // Initialize Kafka Producer
    await initKafkaProducer();
    logger.info("Kafka Producer initialized");
    
    // Initialize Kafka Consumer to receive responses
    await initKafkaConsumer();
    logger.info("Kafka Consumer initialized");
    
    app.listen(PORT, () => {
      logger.info(`API Gateway running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start API Gateway:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();

