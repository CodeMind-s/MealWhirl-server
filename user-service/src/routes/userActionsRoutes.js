const express = require('express');
const userActionCotroller = require('../controllers/userActionsController');
const { addUserItemValidator, deleteUserItemValidator } = require('../validators/userActionsValidators');

const router = express.Router();

router.patch('/:category/:id', addUserItemValidator, userActionCotroller.updateUserItemsByCategory);
router.delete('/:category/:id', deleteUserItemValidator, userActionCotroller.deleteUserItemsByCategory);

module.exports = router;