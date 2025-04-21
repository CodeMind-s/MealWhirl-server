const Joi = require("joi");
const { USER_CATEGORIES } = require("../constants/userConstants");
const BadRequestException = require("../exceptions/BadRequestException");

const restaurentItemSchema = Joi.object({
  optionKey: Joi.string().valid("menu").required().messages({
    "string.base": "Option key must be a string.",
    "string.empty": "Option key is required.",
    "any.required": "Option key is required.",
  }),
  item: Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
      "string.base": "Name must be a string.",
      "string.empty": "Name is required.",
      "string.min": "Name must be at least 3 characters long.",
      "string.max": "Name must not exceed 50 characters.",
      "any.required": "Name is required.",
    }),
    description: Joi.string().max(500).optional().messages({
      "string.base": "Description must be a string.",
      "string.max": "Description must not exceed 500 characters.",
    }),
    price: Joi.number().positive().required().messages({
      "number.base": "Price must be a number.",
      "number.positive": "Price must be a positive number.",
      "any.required": "Price is required.",
    }),
    image: Joi.string().uri().optional().messages({
      "string.base": "Image must be a string.",
      "string.uri": "Image must be a valid URL.",
    }),
    ingredients: Joi.array().items(Joi.string().min(1)).optional().messages({
      "array.base": "Ingredients must be an array.",
      "string.base": "Each ingredient must be a string.",
      "string.min": "Each ingredient must have at least 1 character.",
    }),
    dietaryRestrictions: Joi.array()
      .items(Joi.string().min(1))
      .optional()
      .messages({
        "array.base": "Dietary restrictions must be an array.",
        "string.base": "Each dietary restriction must be a string.",
        "string.min":
          "Each dietary restriction must have at least 1 character.",
      }),
    category: Joi.string().min(3).max(50).required().messages({
      "string.base": "Category must be a string.",
      "string.empty": "Category is required.",
      "string.min": "Category must be at least 3 characters long.",
      "string.max": "Category must not exceed 50 characters.",
      "any.required": "Category is required.",
    }),
    isAvailable: Joi.boolean().optional().messages({
      "boolean.base": "isAvailable must be a boolean value.",
    }),
  })
    .required()
    .messages({
      "object.base": "Item must be an object.",
      "any.required": "Item is required.",
    })
    .unknown(false),
}).unknown(false);

const rideHistorySchema = Joi.object({
  rideId: Joi.string().required().messages({
    "string.base": "Ride ID must be a string.",
    "string.empty": "Ride ID is required.",
    "any.required": "Ride ID is required.",
  }),
  customer: Joi.object({
    name: Joi.string().required().messages({
      "string.base": "Customer name must be a string.",
      "string.empty": "Customer name is required.",
      "any.required": "Customer name is required.",
    }),
    customerId: Joi.string().required().messages({
      "string.base": "Customer ID must be a string.",
      "string.empty": "Customer ID is required.",
      "any.required": "Customer ID is required.",
    }),
  })
    .required()
    .messages({
      "object.base": "Customer must be an object.",
      "any.required": "Customer is required.",
    }),
  pickupLocation: Joi.object({
    latitude: Joi.number().required().messages({
      "number.base": "Pickup latitude must be a number.",
      "any.required": "Pickup latitude is required.",
    }),
    longitude: Joi.number().required().messages({
      "number.base": "Pickup longitude must be a number.",
      "any.required": "Pickup longitude is required.",
    }),
  })
    .required()
    .messages({
      "object.base": "Pickup location must be an object.",
      "any.required": "Pickup location is required.",
    }),
  dropOffLocation: Joi.object({
    latitude: Joi.number().required().messages({
      "number.base": "Drop-off latitude must be a number.",
      "any.required": "Drop-off latitude is required.",
    }),
    longitude: Joi.number().required().messages({
      "number.base": "Drop-off longitude must be a number.",
      "any.required": "Drop-off longitude is required.",
    }),
  })
    .required()
    .messages({
      "object.base": "Drop-off location must be an object.",
      "any.required": "Drop-off location is required.",
    }),
  fare: Joi.object({
    amount: Joi.number().positive().required().messages({
      "number.base": "Fare amount must be a number.",
      "number.positive": "Fare amount must be positive.",
      "any.required": "Fare amount is required.",
    }),
    currency: Joi.string().required().messages({
      "string.base": "Currency must be a string.",
      "string.empty": "Currency is required.",
      "any.required": "Currency is required.",
    }),
    paymentMethod: Joi.string().required().messages({
      "string.base": "Payment method must be a string.",
      "string.empty": "Payment method is required.",
      "any.required": "Payment method is required.",
    }),
  })
    .required()
    .messages({
      "object.base": "Fare must be an object.",
      "any.required": "Fare is required.",
    }),
  date: Joi.date().optional().messages({
    "date.base": "Date must be a valid date.",
  }),
}).unknown(false);

const userByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().trim().lowercase().email(),
      Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
    )
    .required(),
  category: Joi.string()
    .valid(...Object.values(USER_CATEGORIES))
    .required(),
}).unknown(false);

const addUserItemValidator = (req, res, next) => {
  const payload = req.body;
  const { category } = req.params;

  const { error: paramsError } = userByIdSchema.validate(req.params, {
    abortEarly: false,
  });
  if (paramsError) {
    return next(
      new BadRequestException(
        paramsError.details.map((err) => err.message).join(", ")
      )
    );
  }
  if (!Object.values(USER_CATEGORIES).includes(category)) {
    next(new BadRequestException("Invalid user category"));
  }

  let userOptionsSchema;
  switch (category) {
    case USER_CATEGORIES.DRIVER:
      userOptionsSchema = rideHistorySchema;
      break;
    case USER_CATEGORIES.RESTAURANT:
      userOptionsSchema = restaurentItemSchema;
      break;
    default:
      return next(new BadRequestException("Invalid user category"));
  }

  const { error } = userOptionsSchema.validate(payload, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((err) => err.message).join(", ");
    return next(new BadRequestException(errorMessage));
  }
  next();
};

const deletdUserOptionSchema = Joi.object({
  optionKey: Joi.string().valid("menu").required().messages({
    "string.base": "Option key must be a string.",
    "string.empty": "Option key is required.",
    "any.required": "Option key is required.",
  }),
  name: Joi.string().required().messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name is required.",
    "any.required": "Name is required.",
  }),
}).unknown(false);

const deleteUserItemValidator = (req, res, next) => {
  const { category } = req.params;

  if (!Object.values(USER_CATEGORIES).includes(category)) {
    next(new BadRequestException("Invalid user category"));
  }

  const { error: paramsError } = userByIdSchema.validate(req.params, {
    abortEarly: false,
  });
  if (paramsError) {
    return next(
      new BadRequestException(
        paramsError.details.map((err) => err.message).join(", ")
      )
    );
  }

  const { error } = deletdUserOptionSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const errorMessage = error.details.map((err) => err.message).join(", ");
    return next(new BadRequestException(errorMessage));
  }

  next();
};

module.exports = {
  addUserItemValidator,
  deleteUserItemValidator
};
