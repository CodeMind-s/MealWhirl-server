const express = require("express");
const driverController = require("../controllers/driverController");
const { validateAddUpdateVehicle } = require("../validators/driverValidators");
const authorization = require("../middlewares/authorization");
const { PERMISSION_TYPES } = require("../constants/permissionConstants");
const { getOwner } = require("../utils/userUtils");

const { SUPER_ADMIN, ADMINISTRATOR, OWNER, REGISTERED } = PERMISSION_TYPES;

const router = express.Router();

router.post(
  "/vehicle",
  authorization([SUPER_ADMIN, ADMINISTRATOR, REGISTERED], getOwner),
  validateAddUpdateVehicle,
  driverController.createVehicle
);
router.put(
  "/vehicle",
  authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner),
  validateAddUpdateVehicle,
  driverController.updateVehicle
);

module.exports = router;
