const { Router } = require('express');
const orderRoutes = require('./routes/orderRoutes');

/**
 * Contains all API routes for the application.
 */
const router = Router();

router.use('/orders', orderRoutes);
router.use('/health', (req, res) => {
    res.status(200).send("API gateway is healthy");
});

module.exports = router
