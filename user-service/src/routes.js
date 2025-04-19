const { Router } = require('express');
const userRoutes = require('./routes/userRoutes');

/**
 * Contains all API routes for the application.
 */
const router = Router();

router.use('/users', userRoutes);
router.use('/health', (req, res) => {
    res.status(200).send("User Service is healthy");
});


module.exports = router
