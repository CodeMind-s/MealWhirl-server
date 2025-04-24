const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { AUTH_SERVICE_PORT, AUTH_SERVICE_HOST } = require("../constants/configConstants");

const router = Router();

router.use(
  "/",
  createProxyMiddleware({
    target: `http://${AUTH_SERVICE_HOST}:${AUTH_SERVICE_PORT}`, // Target service
    changeOrigin: true, // Changes the Host header to match the target
    logLevel: "debug", // Enable detailed logging for debugging
  })
);

module.exports = router;
