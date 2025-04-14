const express = require("express");
const userController = require("../controllers/userController");
const { validateCreateUser, validateUpdateUser, validateGetAllUsers, validateGetUserByIdentifier, validateDeleteUserAccountByIdentifier, validateAccountStatusUpdateUserByIdentifier } = require("../validators/userValidators");
const authorization = require("../middlewares/authorization");
const { PERMISSION_TYPES } = require("../constants/permissionConstants");
const { getOwner } = require("../utils/userUtils");

const { ANY, SUPER_ADMIN, ADMINISTRATOR, OWNER } = PERMISSION_TYPES;

const router = express.Router();

router.get("/:category", authorization([SUPER_ADMIN, ADMINISTRATOR]), validateGetAllUsers, userController.getAllUsersByCategory);
router.get("/:category/:id", authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner), validateGetUserByIdentifier, userController.getUserByIdentifier);
router.post("/:category", authorization([ANY]), validateCreateUser, userController.createUserByCategory);
router.put("/:category/:id", authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner), validateUpdateUser, userController.updateUserByCategory);
router.delete("/:category/:id", authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner), validateDeleteUserAccountByIdentifier, userController.deleteAccountByIdentifier);
router.patch("/:category/:id", authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner), validateAccountStatusUpdateUserByIdentifier, userController.updateUserAccountStatusByIdentifier);

module.exports = router;
