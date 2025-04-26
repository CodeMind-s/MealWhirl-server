const Joi = require("joi");
const {
  USER_CATEGORIES,
  USER_ACCOUNT_STATUS,
  ADMIN_TYPES,
  USER_IDENTIFIER_TYPES,
} = require("../constants/userConstants");
const BadRequestException = require("../exceptions/BadRequestException");

const defaultUserSchema = {
  name: Joi.string().trim().optional(),
  [USER_IDENTIFIER_TYPES.EMAIL]: Joi.string()
    .trim()
    .lowercase()
    .email()
    .optional(),
  [USER_IDENTIFIER_TYPES.PHONE]: Joi.string()
    .trim()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  profilePicture: Joi.string().trim().optional(),
};

const customerSchema = defaultUserSchema;

const createCustomerSchema = Joi.object({
  identifier: Joi.string().required(),
})
  .concat(Joi.object(customerSchema))
  .unknown(false);

const updateCustomerSchema = Joi.object(customerSchema).unknown(false);

const driverSchema = {
  ...defaultUserSchema,
  vehicle: Joi.string().required(),
  city: Joi.string().trim().required(),
  driverLicense: Joi.string().trim().required(),
  nationalId: Joi.string().trim().required(),
};

const createDriverSchema = Joi.object({
  identifier: Joi.string().required(),
})
  .concat(Joi.object(driverSchema))
  .unknown(false);

const updateDriverSchema = Joi.object(driverSchema).unknown(false);

const mandatoryRestaurantSchema = {
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
  location: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required(),
  registrationNumber: Joi.string().required(),
  owner: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().trim().lowercase().email().required(),
    phone: Joi.string()
      .trim()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required(),
    nationalId: Joi.string().required(),
  }).required(),
};

const createRestaurantSchema = Joi.object({
  identifier: Joi.string().required(),
  restaurant: Joi.object(mandatoryRestaurantSchema).required(),
})
  .concat(Joi.object(defaultUserSchema))
  .unknown(false);

const updateRestaurantSchema = Joi.object({
  ...defaultUserSchema,
  restaurant: Joi.object(mandatoryRestaurantSchema).optional(),
}).unknown(false);

const adminSchema = {
  ...defaultUserSchema,
  role: Joi.string()
    .valid(...ADMIN_TYPES)
    .required(),
  permissions: Joi.array().items(Joi.string()).optional(),
};

const createAdminSchema = Joi.object({
  identifier: Joi.string().required(),
})
  .concat(Joi.object(adminSchema))
  .unknown(false);

const updateAdminSchema = Joi.object(adminSchema).unknown(false);

const userByIdAndCategorySchema = Joi.object({
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

const userByIdentifierSchema = Joi.object({
  identifier: Joi.alternatives()
    .try(
      Joi.string().trim().lowercase().email(),
      Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
    )
    .required(),
}).unknown(false);


const createUserByIdentifierSchema = Joi.object({
  identifier: Joi.string().required(), 
  type: Joi.string().valid(...Object.values(USER_IDENTIFIER_TYPES)).required(),
  verified: Joi.boolean().valid(true).required(),
  password: Joi.string().required(),
  accountStatus: Joi.string().valid(USER_ACCOUNT_STATUS.CREATING).required(),
  category: Joi.string().valid(USER_CATEGORIES.REGISTERD).required(),
});

const validateCreateUserByCategory = (req, res, next) => {
  const payload = req.body;
  const { category } = req.params;
  if (!Object.values(USER_CATEGORIES).includes(category)) {
    next(new BadRequestException("Invalid user category"));
  }
  let schema = null;
  switch (category) {
    case USER_CATEGORIES.CUSTOMER:
      schema = createCustomerSchema;
      break;
    case USER_CATEGORIES.DRIVER:
      schema = createDriverSchema;
      break;
    case USER_CATEGORIES.RESTAURANT:
      schema = createRestaurantSchema;
      break;
    case USER_CATEGORIES.ADMIN:
      schema = createAdminSchema;
      break;
    default:
      return next(new BadRequestException("Invalid user category"));
  }
  const { error } = schema.validate(payload, { abortEarly: false });
  if (error) {
    return next(
      new BadRequestException(
        error.details.map((err) => err.message).join(", ")
      )
    );
  }
  return next();
};

const validateUpdateUserByCategoryAndIdentifier = (req, res, next) => {
  const payload = req.body;
  const { category } = req.params;

  const { error: paramsError } = userByIdAndCategorySchema.validate(
    req.params,
    { abortEarly: false }
  );
  if (paramsError) {
    return next(
      new BadRequestException(
        paramsError.details.map((err) => err.message).join(", ")
      )
    );
  }

  let schema = null;
  switch (category) {
    case USER_CATEGORIES.CUSTOMER:
      schema = updateCustomerSchema;
      break;
    case USER_CATEGORIES.DRIVER:
      schema = updateDriverSchema;
      break;
    case USER_CATEGORIES.RESTAURANT:
      schema = updateRestaurantSchema;
      break;
    case USER_CATEGORIES.ADMIN:
      schema = updateAdminSchema;
      break;
    default:
      return new BadRequestException("Invalid user category");
  }
  const { error: payloadError } = schema.validate(payload, {
    abortEarly: false,
  });
  if (payloadError) {
    return next(
      new BadRequestException(
        payloadError.details.map((err) => err.message).join(", ")
      )
    );
  }
  return next();
};

const validateGetAllUsersByCategory = (req, res, next) => {
  const { category } = req.params;
  if (!Object.values(USER_CATEGORIES).includes(category)) {
    return next(new BadRequestException("Invalid user category"));
  }
  return next();
};

const validateGetUserByIdentifierAndCategory = (req, res, next) => {
  const { error } = userByIdAndCategorySchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    return next(
      new BadRequestException(
        error.details.map((err) => err.message).join(", ")
      )
    );
  }
  return next();
};

const validateDeleteUserAccountByCategoryAndIdentifier = (req, res, next) => {
  const { error } = userByIdAndCategorySchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    return next(
      new BadRequestException(
        error.details.map((err) => err.message).join(", ")
      )
    );
  }
  return next();
};

const validateAccountStatusUpdatByCategoryAndIdentifier = (req, res, next) => {
  const { error } = userByIdAndCategorySchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    return next(
      new BadRequestException(
        error.details.map((err) => err.message).join(", ")
      )
    );
  }
  if (!req.body.status) {
    return next(new BadRequestException("Status is required"));
  }
  if (!Object.values(USER_ACCOUNT_STATUS).includes(req.body.status)) {
    return next(new BadRequestException("Invalid status"));
  }
  return next();
};

const validateGetUserByIdentifier = (req, res, next) => {
  const { error } = userByIdentifierSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return next(
      new BadRequestException(
        error.details.map((err) => err.message).join(", ")
      )
    );
  }
  return next();
};

const validateCreateUpdateUserByIdentifier = (req, res, next) => {
  const { error } = createUserByIdentifierSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next(
      new BadRequestException(
        error.details.map((err) => err.message).join(", ")
      )
    );
  }
  return next();
};

module.exports = {
  validateCreateUserByCategory,
  validateGetAllUsersByCategory,
  validateGetUserByIdentifierAndCategory,
  validateUpdateUserByCategoryAndIdentifier,
  validateAccountStatusUpdatByCategoryAndIdentifier,
  validateDeleteUserAccountByCategoryAndIdentifier,
  validateGetUserByIdentifier,
  validateCreateUpdateUserByIdentifier
};
