const { Kafka } = require('kafkajs');
const logger = require('../utils/logger');

const kafka = new Kafka({
    clientId: 'auth-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'auth-service-group' });

// Avoid circular dependency by declaring controller variable
let authController;

const initKafkaProducer = async () => {
    await producer.connect();
};

const initKafkaConsumer = async () => {
    // Require controller here to avoid circular dependency
    authController = require('../controllers/authController');

    await consumer.connect();

    // Subscribe to authentication-related topics
    await consumer.subscribe({
        topics: ['auth-request', 'auth-validation'],
        fromBeginning: false
    });

    await consumer.run({
        eachMessage: async ({ topic, _, message }) => {
            const messageValue = JSON.parse(message.value.toString());
            logger.info(`Received message from topic ${topic}:`, messageValue);

            if (topic === 'auth-request') {
                // Handle API gateway requests for authentication
                try {
                    const { action, payload, correlationId } = messageValue;

                    let responseData;
                    let success = true;
                    let statusCode = 200;

                    switch (action) {
                        case 'login':
                            responseData = await authController.login(payload);
                            break;
                        case 'register':
                            responseData = await authController.register(payload);
                            statusCode = 201;
                            break;
                        default:
                            success = false;
                            responseData = { message: `Unknown action: ${action}` };
                            statusCode = 400;
                    }

                    // Send response back to API gateway
                    await producer.send({
                        topic: 'auth-response',
                        messages: [
                            {
                                value: JSON.stringify({
                                    correlationId,
                                    success,
                                    statusCode,
                                    data: responseData,
                                    timestamp: new Date().toISOString()
                                })
                            }
                        ]
                    });
                } catch (error) {
                    console.error('Error processing auth request:', error);

                    // Send error response
                    await producer.send({
                        topic: 'auth-response',
                        messages: [
                            {
                                value: JSON.stringify({
                                    correlationId: messageValue.correlationId,
                                    success: false,
                                    statusCode: error.statusCode || 500,
                                    message: error.message,
                                    timestamp: new Date().toISOString()
                                })
                            }
                        ]
                    });
                }
            } else if (topic === 'auth-validation') {
                // Handle validation requests (e.g., token validation)
                try {
                    const { token, correlationId } = messageValue;
                    const isValid = await authController.validateToken(token);

                    // Send validation result back to the requesting service
                    await producer.send({
                        topic: 'auth-validation-response',
                        messages: [
                            {
                                value: JSON.stringify({
                                    correlationId,
                                    isValid,
                                    timestamp: new Date().toISOString()
                                })
                            }
                        ]
                    });
                } catch (error) {
                    console.error('Error validating token:', error);

                    // Send failure message
                    await producer.send({
                        topic: 'auth-validation-response',
                        messages: [
                            {
                                value: JSON.stringify({
                                    correlationId: messageValue.correlationId,
                                    isValid: false,
                                    error: error.message,
                                    timestamp: new Date().toISOString()
                                })
                            }
                        ]
                    });
                }
            }
        }
    });
};

const produceMessage = async (topic, message) => {
    try {
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }]
        });
        logger.info(`Message sent to topic ${topic}`);
        return true;
    } catch (error) {
        console.error(`Error producing message to ${topic}:`, error);
        return false;
    }
};

module.exports = {
    initKafkaProducer,
    initKafkaConsumer,
    produceMessage
};