const { Router } = require("express");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Contains all API routes for the application.
 */
const router = Router();

router.use("/orders", orderRoutes);
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/health", (req, res) => {
  res.status(200).send("API gateway is healthy");
});

module.exports = router;
