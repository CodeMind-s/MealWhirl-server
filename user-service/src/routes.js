const { Router } = require('express');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

/**
 * Contains all API routes for the application.
 */
const router = Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);

module.exports = router
