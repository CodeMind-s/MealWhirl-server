const { Router } = require("express");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Contains all API routes for the application.
 */
const router = Router();

router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/notifications", notificationRoutes);
router.use("/health", (req, res) => {
  res.status(200).send("API gateway is healthy");
});

module.exports = router;
