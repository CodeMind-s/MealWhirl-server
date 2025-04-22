const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const httpContext = require("express-http-context");
require("dotenv").config();
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const tokenHandler = require("./middlewares/tokenHandler");
const $404Handler = require('./middlewares/404Handler');
const errorLogger = require("./middlewares/errorLogger");
const logger = require("./utils/logger");
const { logStream } = require("./utils/logger");
// const {initKafkaProducer, initKafkaConsumer} = require("./services/kafkaService");
const router = require("./routes");
const {
    BASE_URL,
    APP_PORT,
    APP_HOST,
    KEEP_ALIVE_TIME_OUT,
    HEADERS_TIME_OUT, IMMEDIATE_LOG_FORMAT, LOG_FORMAT
} = require("./constants/configConstants");

const startServer = async () => {
    try {
        await connectDB();
        logger.info("MongoDB connected successfully");

        // await initKafkaProducer();
        // logger.info("Kafka Producer initialized");
        
        // await initKafkaConsumer();
        // logger.info("Kafka Consumer initialized");

        const app = express();
        app.set("port", APP_PORT);
        app.set("host", APP_HOST);

        app.use(cors());
        app.use(helmet());
        app.use(compression());
        app.use(httpContext.middleware);
        app.use(express.json());

        app.use(
            morgan(IMMEDIATE_LOG_FORMAT, {
                immediate: true,
                stream: logStream
            })
        );
        app.use(
            morgan(LOG_FORMAT, {
                stream: logStream
            })
        );

        app.use(tokenHandler());

        app.use(BASE_URL, router);

        app.use($404Handler);

        app.use(errorLogger());

        app.use(errorHandler());

        const server = app.listen(app.get("port"), app.get("host"), () => {
            logger.info(
                `Server started listening at: http://${app.get("host")}:${app.get("port")}${BASE_URL}`
            );
        });

        server.keepAliveTimeout = KEEP_ALIVE_TIME_OUT;
        server.headersTimeout = HEADERS_TIME_OUT;
    } catch (error) {
        logger.error("Failed to start User Service:", error);
        process.exit(1);
    }
}

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    logger.error("Uncaught exception", err);
    process.exit(1);
});

startServer().then(() => logger.info("User Service started successfully"));