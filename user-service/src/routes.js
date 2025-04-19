const { Router } = require('express');
const userRoutes = require('./routes/userRoutes');
const userActionsRoutes = require('./routes/userActionsRoutes');

/**
 * Contains all API routes for the application.
 */
const router = Router();

router.use('/users', userRoutes);
router.use('/user-actions', userActionsRoutes);
router.use('/health', (req, res) => {
    res.status(200).send("User Service is healthy");
});


module.exports = router
