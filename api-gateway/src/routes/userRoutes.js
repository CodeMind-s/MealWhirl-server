const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { USER_SERVICE_PORT, USER_SERVICE_HOST } = require("../constants/configConstants");

const router = Router();

router.use(
  "/",
  createProxyMiddleware({
    target: `http://${USER_SERVICE_HOST}:${USER_SERVICE_PORT}`, // Target service
    changeOrigin: true, // Changes the Host header to match the target
    logLevel: "debug", // Enable detailed logging for debugging
  })
);

module.exports = router;