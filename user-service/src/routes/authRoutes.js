const express = require("express");
const {PERMISSION_TYPES} = require("../constants/permissionConstants");
const {validateLogin, validateRegister} = require("../validators/tokenValidators");
const {login, register} = require("../controllers/authController");

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

module.exports = router;
