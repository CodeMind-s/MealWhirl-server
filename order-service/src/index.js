require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const orderRoutes = require("./routes/orderRoutes");
const { initKafkaProducer } = require("./services/kafkaService");

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(express.json());

// Routes
app.use("/orders", orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke in the Order Service!');
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

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Order Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Order Service:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();