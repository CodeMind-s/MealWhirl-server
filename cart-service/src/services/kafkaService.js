const { Kafka } = require("kafkajs");
const logger = require("../utils/logger"); // Import logger for consistent logging

const kafka = new Kafka({
  clientId: "cart-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "cart-service-group" });

// Import controllers at the module level
let cartController;

const initKafkaProducer = async () => {
  try {
    await producer.connect();
    logger.info("[KAFKA] Producer connected successfully");
  } catch (error) {
    logger.error("[KAFKA] Error connecting producer", { error: error.message, stack: error.stack });
    throw error;
  }
};

const initKafkaConsumer = async () => {
  // Avoid circular dependency by requiring controller here
  cartController = require("../controllers/cartController");

  try {
    await consumer.connect();
    logger.info("[KAFKA] Consumer connected successfully");

    // Subscribe to request topics and inter-service communication
    await consumer.subscribe({
      topics: ["cart-request"],
      fromBeginning: false,
    });
    logger.info("[KAFKA] Subscribed to topics: cart-request");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageValue = JSON.parse(message.value.toString());
          logger.info(`[KAFKA] Received message from topic ${topic}`, { message: messageValue });

          if (topic === "cart-request") {
            // Handle API gateway requests
            const { action, payload, correlationId } = messageValue;

            let responseData;
            let success = true;
            let statusCode = 200;

            switch (action) {
              case "addToCart":
                responseData = await cartController.addToCart(payload);
                statusCode = 201;
                break;
              case "getAllCarts":
                responseData = await cartController.getAllCarts();
                statusCode = 200;
                break;
              case "getCartById":
                responseData = await cartController.getCartById(payload.id);
                statusCode = 200;
                break;
              case "getCartByUserId":
                responseData = await cartController.getCartByUserId(payload.userId);
                statusCode = 200;
                break;
              case "updateCartItem":
                responseData = await cartController.updateCartItem(payload);
                statusCode = 200;
                break;
              case "removeItemFromCart":
                responseData = await cartController.removeItemFromCart(payload);
                statusCode = 200;
                break;
              case "deleteCart":
                responseData = await cartController.deleteCart(payload.id);
                statusCode = 200;
                break;
              case "setActiveRestaurant":
                responseData = await cartController.setActiveRestaurant(payload.userId, payload.restaurantId);
                statusCode = 200;
                break;
              default:
                success = false;
                responseData = { message: `Unknown action: ${action}` };
                statusCode = 400;
            }

            // Send response back to API gateway
            await producer.send({
              topic: "cart-response",
              messages: [
                {
                  value: JSON.stringify({
                    correlationId,
                    success,
                    statusCode,
                    data: responseData,
                    timestamp: new Date().toISOString(),
                  }),
                },
              ],
            });
            logger.info(`[KAFKA] Sent response to cart-response`, { correlationId, action });
          }
        } catch (error) {
          logger.error(`[KAFKA] Error processing message from topic ${topic}`, {
            error: error.message,
            stack: error.stack,
          });

          // Send error response
          await producer.send({
            topic: "cart-response",
            messages: [
              {
                value: JSON.stringify({
                  correlationId: messageValue?.correlationId || null,
                  success: false,
                  statusCode: error.statusCode || 500,
                  message: error.message || "Error processing request",
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          });
        }
      },
    });
  } catch (error) {
    logger.error("[KAFKA] Error initializing consumer", { error: error.message, stack: error.stack });
    throw error;
  }
};

const produceMessage = async (topic, message) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    logger.info(`[KAFKA] Message sent to topic ${topic}`, { message });
    return true;
  } catch (error) {
    logger.error(`[KAFKA] Error producing message to ${topic}`, {
      error: error.message,
      stack: error.stack,
    });
    throw error; // Throw error instead of returning false
  }
};

module.exports = {
  initKafkaProducer,
  initKafkaConsumer,
  produceMessage,
};