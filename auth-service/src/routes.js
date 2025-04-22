const { Router } = require('express');
const authRoutesV1 = require('./routes/authRoutes');

/**
 * Contains all API routes for the application.
 */
const router = Router();

router.use('/V1', authRoutesV1);
router.use('/health', (req, res) => {
    res.status(200).send("Auth Service is healthy");
});


module.exports = router
