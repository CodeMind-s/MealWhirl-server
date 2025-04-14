const express = require("express");
const userController = require("../controllers/userController");
const { validateCreateUser, validateUpdateUser, validateGetAllUsers, validateGetUserByIdentifier, validateDeleteUserAccountByIdentifier, validateAccountStatusUpdateUserByIdentifier } = require("../validators/userValidators");
const authorization = require("../middlewares/authorization");
const { PERMISSION_TYPES } = require("../constants/permissionConstants");

const { ANY } = PERMISSION_TYPES;

const router = express.Router();

router.get("/:category", authorization([ANY]), validateGetAllUsers, userController.getAllUsersByCategory);
router.get("/:category/:id", authorization([ANY]), validateGetUserByIdentifier, userController.getUserByIdentifier);
router.post("/:category", authorization([ANY]), validateCreateUser, userController.createUserByCategory);
router.put("/:category/:id", authorization([ANY]), validateUpdateUser, userController.updateUserByCategory);
router.delete("/:category/:id", authorization([ANY]), validateDeleteUserAccountByIdentifier, userController.deleteAccountByIdentifier);
router.patch("/:category/:id", authorization([ANY]), validateAccountStatusUpdateUserByIdentifier, userController.updateUserAccountStatusByIdentifier);

module.exports = router;
