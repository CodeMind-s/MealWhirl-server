const { Router } = require("express");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Contains all API routes for the application.
 */
const router = Router();

router.use("/api/v1/orders", orderRoutes);
router.use("/api/v1/payments", paymentRoutes);
router.use("/api/v1/carts", cartRoutes);
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/api/v1/notifications", notificationRoutes);
router.use("/health", (req, res) => {
  res.status(200).send("API gateway is healthy");
});

module.exports = router;
