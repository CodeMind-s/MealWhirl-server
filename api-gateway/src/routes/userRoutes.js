const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { APP_HOST, USER_SERVICE_PORT } = require("../constants/configConstants");

const router = Router();

router.use(
  "/",
  createProxyMiddleware({
    target: `http://${APP_HOST}:${USER_SERVICE_PORT}`, // Target service
    changeOrigin: true, // Changes the Host header to match the target
    logLevel: "debug", // Enable detailed logging for debugging
  })
);

module.exports = router;