const express = require('express');
const userActionCotroller = require('../controllers/userActionsController');
const userItemValidator = require('../validators/userActionsValidators');

const router = express.Router();

router.patch('/:category/:id', userItemValidator, userActionCotroller.updateUserItemsByCategory);

module.exports = router;