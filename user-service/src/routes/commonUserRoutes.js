const express = require("express");
const userController = require("../controllers/commonUserController");
const {
  validateCreateUserByCategory,
  validateUpdateUserByCategoryAndIdentifier,
  validateGetAllUsersByCategory,
  validateGetUserByIdentifier,
  validateDeleteUserAccountByCategoryAndIdentifier,
  validateAccountStatusUpdatByCategoryAndIdentifier,
  validateGetUserByIdentifierAndCategory,
  validateCreateUpdateUserByIdentifier
} = require("../validators/commonUserValidators");
const authorization = require("../middlewares/authorization");
const { PERMISSION_TYPES } = require("../constants/permissionConstants");
const { getOwner } = require("../utils/userUtils");

const { ANY, SUPER_ADMIN, ADMINISTRATOR, OWNER, REGISTERED } = PERMISSION_TYPES;

const router = express.Router();

router.post(
  "/get-by-id",
  authorization([ANY]),
  validateGetUserByIdentifier,
  userController.getUserDataByIdentifier
);
router.put(
  "/identifier",
  authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER, REGISTERED], getOwner),
  validateCreateUpdateUserByIdentifier,
  userController.updateUserByIdentifier
);
router.post(
  "/identifier",
  authorization([ANY]),
  validateCreateUpdateUserByIdentifier,
  userController.createUserByIdentifier
);
router.get(
  "/:category",
  authorization([ANY]),
  validateGetAllUsersByCategory,
  userController.getAllUsersByCategory
);
router.get(
  "/:category/:id",
  authorization([ANY]),
  validateGetUserByIdentifierAndCategory,
  userController.getUserByIdentifierAndCategory
);
router.put(
  "/:category/:id",
  authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner),
  validateUpdateUserByCategoryAndIdentifier,
  userController.updateUserByCategoryAndIdentifier
);
router.delete(
  "/:category/:id",
  authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner),
  validateDeleteUserAccountByCategoryAndIdentifier,
  userController.deleteAccountByCategoryAndIdentifier
);
router.patch(
  "/:category/:id",
  authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner),
  validateAccountStatusUpdatByCategoryAndIdentifier,
  userController.updateUserAccountStatusByCategoryAndIdentifier
);
router.post(
  "/:category",
  authorization([ANY]),
  validateCreateUserByCategory,
  userController.createUserByCategory
);

module.exports = router;
