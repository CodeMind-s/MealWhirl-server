const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = Router();

router.use(
  "/",
  createProxyMiddleware({
    target: "http://user-service:5001", // Target service
    changeOrigin: true, // Changes the Host header to match the target
    logLevel: "debug", // Enable detailed logging for debugging
  })
);

module.exports = router;
