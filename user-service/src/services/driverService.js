const { get } = require("mongoose");
const Vehicle = require("../models/vehicleModel");
const { getUserId, getUserRole } = require("../utils/contextUtils");
const commonUserService = require("./commonUserService");
const {
  USER_CATEGORIES,
  USER_ACCOUNT_STATUS,
} = require("../constants/userConstants");
const ForbiddenException = require("../exceptions/ForbiddenException");
const logger = require("../utils/logger");
const Driver = require("../models/driverModel");

const createVehicle = async (vehicleData) => {
  logger.profile("Create vehicle");
  try {
    const userId = getUserId();
    const userRole = getUserRole();
    const { identifier } = vehicleData;
    const driver = await commonUserService.getUserByIdentifier(identifier);

    if (!driver) {
      logger.error("Driver not found");
      throw new ForbiddenException("Driver not found");
    }
    if (
      ![
        USER_CATEGORIES.DRIVER,
        USER_CATEGORIES.ADMIN,
        USER_CATEGORIES.SUPER_ADMIN,
        USER_CATEGORIES.REGISTERD,
      ].includes(userRole)
    ) {
      const errorMessage = `User category ${driver.category} is not allowed to create vehicle`;
      logger.error(errorMessage);
      throw new ForbiddenException(errorMessage);
    }

    const existingVehicleByNumber = await Vehicle.findOne({
      licensePlate: vehicleData.licensePlate,
    });
    if (existingVehicleByNumber && existingVehicleByNumber.verified) {
      logger.error("Vehicle number already exists");
      throw new ForbiddenException("Vehicle number already exists");
    } else if (existingVehicleByNumber) {
      logger.error("Vehicle number already exists but not verified");
      const vehicle = await Vehicle.findOneAndUpdate(
        { licensePlate: vehicleData.licensePlate },
        { ...vehicleData, updatedBy: userId },
        { new: true }
      );

      await Driver.findOneAndUpdate(
        { identifier },
        { vehicle: vehicle._id },
        { new: true }
      );
      return vehicle;
    }
    const existingVehicleByIdentifier = await Vehicle.findOne({
      driver: vehicleData.identifier,
    });
    if (existingVehicleByIdentifier) {
      logger.error("Vehicle already exists for this driver");
      throw new ForbiddenException("Vehicle already exists for this driver");
    }

    const vehicleObject = new Vehicle({
      ...vehicleData,
      driver: identifier,
      createdBy: userId,
      updatedBy: userId,
    });
    const vehicle = await vehicleObject.save();

    await Driver.findOneAndUpdate(
      { identifier },
      { vehicle: vehicle._id },
      { new: true }
    );

    return vehicle;
  } catch (error) {
    logger.error(`Error creating vehicle: ${error.message}`);
    throw error;
  } finally {
    logger.profile("Create vehicle");
  }
};

const updateVehicle = async (vehicleData) => {
  try {
    const { identifier } = vehicleData;
    const userId = getUserId();
    const userRole = getUserRole();

    const driver = await commonUserService.getUserByIdentifier(
      identifier,
      USER_CATEGORIES.DRIVER
    );

    if (!driver) {
      logger.error("Driver not found");
      throw new ForbiddenException("Driver not found");
    }

    if (driver.accountStatus !== USER_ACCOUNT_STATUS.ACTIVE) {
      logger.error("User account is not active");
      throw new ForbiddenException("User account is not active");
    }
    if (
      ![
        USER_CATEGORIES.DRIVER,
        USER_CATEGORIES.ADMIN,
        USER_CATEGORIES.SUPER_ADMIN,
      ].includes(userRole)
    ) {
      const errorMessage = `User category ${user.category} is not allowed to update vehicle`;
      logger.error(errorMessage);
      throw new ForbiddenException(errorMessage);
    }

    const vehicle = await Vehicle.findOneAndUpdate(
      { driver: identifier },
      { ...vehicleData, updatedBy: userId },
      {
        new: true,
      }
    );

    return vehicle;
  } catch (error) {
    logger.error("Error updating vehicle:", error.message);
    throw error;
  }
};

const deleteVehicle = async (vehicleId) => {
  try {
    const userId = getUserId();

    const user = await commonUserService.getUserByIdentifier(
      userId,
      USER_CATEGORIES.DRIVER
    );
    if (!user) {
      logger.error("User not found");
      throw new ForbiddenException("User not found");
    }
    if (user.accountStatus === USER_ACCOUNT_STATUS.ACTIVE) {
      logger.error("User account is not active");
      throw new ForbiddenException("User account is not active");
    }
    if (
      ![
        USER_CATEGORIES.DRIVER,
        USER_CATEGORIES.ADMIN,
        USER_CATEGORIES.SUPER_ADMIN,
      ].includes(user.category)
    ) {
      const errorMessage = `User category ${user.category} is not allowed to remove vehicle`;
      logger.error(errorMessage);
      throw new ForbiddenException(errorMessage);
    }

    await Vehicle.findByIdAndDelete(vehicleId);

    return {
      message: "Vehicle removed successfully",
      driver: userId,
    };
  } catch (error) {
    logger.error("Error removing vehicle:", error.message);
    throw error;
  }
};

module.exports = {
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
