const { Router } = require('express');
const commonUserRoutes = require('./routes/commonUserRoutes');
const driverRoutes = require('./routes/driverRoutes')
const customerRoutes = require('./routes/customerRoutes')
const restaurantRoutes = require('./routes/restaurantRoutes')

/**
 * Contains all API routes for the application.
 */
const router = Router();

router.use('/driver', driverRoutes);
router.use('/customer', customerRoutes);
router.use('/restaurant', restaurantRoutes);
router.use('/', commonUserRoutes);
router.use('/health', (req, res) => {
    res.status(200).send("User Service is healthy");
});

module.exports = router
