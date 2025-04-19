const express = require("express");
const authService = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../validators/tokenValidators");

const router = express.Router();

router.post("/register", validateRegister, authService.register);
router.post("/login", validateLogin, authService.login);

module.exports = router;
