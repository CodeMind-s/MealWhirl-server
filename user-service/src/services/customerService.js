const Vehicle = require("../models/vehicleModel");
const { getUserId } = require("../utils/contextUtils");
const commonUserService = require("./commonUserService");
const ForbiddenException = require("../exceptions/ForbiddenException");
const logger = require("../utils/logger");
const Customer = require("../models/customerModel");
const Payment = require("../models/paymentModel");

const addPayemntMethod = async (paymentData) => {
  logger.profile("Adding payment method");
  try {
    const userId = getUserId();
    const { identifier } = paymentData;
    const user = await commonUserService.getUserByIdentifier(identifier);

    if (!user) {
      logger.error("User not found");
      throw new ForbiddenException("User not found");
    }

    console.log(paymentData);
    const existingPaymentMethod = await Payment.findOne({
      customer: identifier,
      cardNumber: paymentData.cardNumber,
    });
    if (existingPaymentMethod) {
      logger.error("Payment method already exists");
      throw new ForbiddenException("Payment method already exists");
    }

    const paymentObject = new Payment({
      ...paymentData,
      customer: identifier,
      createdBy: userId,
      updatedBy: userId,
    });
    const paymentMethod = await paymentObject.save();

    await Customer.findOneAndUpdate(
      { identifier: identifier },
      { $push: { paymentMethods: paymentMethod._id } },
      { new: true }
    );

    return paymentMethod;
  } catch (error) {
    logger.error(`Error adding payment method: ${error.message}`);
    throw error;
  } finally {
    logger.profile("Adding payment method");
  }
};

const removePaymentMethod = async (paymentData) => {
  logger.profile("Removing payment method");
  try {
    const userId = getUserId();
    const { identifier } = paymentData;
    const user = await commonUserService.getUserByIdentifier(identifier);

    if (!user) {
      logger.error("User not found");
      throw new ForbiddenException("User not found");
    }

    const existingPaymentMethod = await Payment.findOne({
      customer: identifier,
      cardNumber: paymentData.cardNumber,
    });
    if (!existingPaymentMethod) {
      logger.error("Payment method does not exist");
      throw new ForbiddenException("Payment method does not exist");
    }

    await Payment.deleteOne({ _id: existingPaymentMethod._id });

    await Customer.findOneAndUpdate(
      { identifier: identifier },
      { $pull: { paymentMethods: existingPaymentMethod._id } },
      { new: true }
    );

    return { message: "Payment method removed successfully" };
  } catch (error) {
    logger.error(`Error removing payment method: ${error.message}`);
    throw error;
  } finally {
    logger.profile("Removing payment method");
  }
};

module.exports = {
  addPayemntMethod,
  removePaymentMethod,
};
