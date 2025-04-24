const express = require("express");
const restaurantController = require("../controllers/restaurantController");
const authorization = require("../middlewares/authorization");
const { PERMISSION_TYPES } = require("../constants/permissionConstants");
const { getOwner } = require("../utils/userUtils");
const { validateMenuItem, validateGetMenuItem } = require("../validators/restaurantValidators");

const { SUPER_ADMIN, ADMINISTRATOR, OWNER } = PERMISSION_TYPES;

const router = express.Router();

router.get(
  "/id/:id/menu/:menuId",
  authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner),
  validateGetMenuItem,
  restaurantController.getMenuItemByName
);
router.post(
  "/menu",
  authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner),
  validateMenuItem,
  restaurantController.addMenuItem
);
router.put(
  "/menu",
  authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner),
  validateMenuItem,
  restaurantController.updateMenuItem
);
router.delete(
  "/id/:id/menu/:menuId",
  authorization([SUPER_ADMIN, ADMINISTRATOR, OWNER], getOwner),
  validateGetMenuItem,
  restaurantController.deleteMenuItem
);

module.exports = router;
