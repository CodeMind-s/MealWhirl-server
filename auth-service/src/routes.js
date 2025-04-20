const { Router } = require('express');
const authRoutes = require('./routes/authRoutes');

/**
 * Contains all API routes for the application.
 */
const router = Router();

router.use('/auth', authRoutes);
router.use('/health', (req, res) => {
    res.status(200).send("Auth Service is healthy");
});


module.exports = router
