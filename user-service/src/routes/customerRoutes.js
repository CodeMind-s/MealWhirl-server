const express = require("express");
const customerController = require("../controllers/customerController");
const { validateAddUpdateVehicle } = require("../validators/driverValidators");
const authorization = require("../middlewares/authorization");
const { PERMISSION_TYPES } = require("../constants/permissionConstants");
const { getOwner } = require("../utils/userUtils");
const { validatePaymentMethod } = require("../validators/customerValidators");

const { SUPER_ADMIN, ADMINISTRATOR, OWNER, REGISTERED } = PERMISSION_TYPES;

const router = express.Router();

router.post(
  "/payment",
  authorization([SUPER_ADMIN, ADMINISTRATOR, REGISTERED], getOwner),
  validatePaymentMethod,
  customerController.addPaymentMethod
);
router.put(
  "/payment",
  authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner),
  validatePaymentMethod,
  customerController.removePaymentMethod
);
router.delete(
  "/payment",
  authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner),
  customerController.removePaymentMethod
);

module.exports = router;
