const Joi = require('joi');
const { USER_CATEGORIES, USER_ACCOUNT_STATUS, ADMIN_TYPES, USER_IDENTIFIER_TYPES } = require('../constants/userConstants');
const BadRequestException = require('../exceptions/BadRequestException');
const { VEHICLE_TYPES } = require('../constants/commonConstants');

const defaultUserSchema = {
    name: Joi.string().trim().optional(),
    [USER_IDENTIFIER_TYPES.EMAIL]: Joi.string().trim().lowercase().email().optional(),
    [USER_IDENTIFIER_TYPES.PHONE]: Joi.string().trim().pattern(/^\+?[1-9]\d{1,14}$/).optional(),    
    profilePicture: Joi.string().trim().optional()
};

const customerSchema = defaultUserSchema;

const createCustomerSchema = Joi.object({
    identifier: Joi.string().required(),
}).concat(Joi.object(customerSchema)).unknown(false);

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
}).concat(Joi.object(driverSchema)).unknown(false);

const updateDriverSchema = Joi.object(driverSchema).unknown(false);

const restaurantSchema = {
    name: Joi.string().trim().required(),
    email: Joi.string().trim().lowercase().email().optional(),
    phoneNumber: Joi.string().trim().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    isEmailVerified: Joi.boolean().optional(),
    isPhoneVerified: Joi.boolean().optional(),
    profilePicture: Joi.string().trim().optional(),
    address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().required(),
        country: Joi.string().required()
    }).optional(),
    location: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required()
    }).required(),
    paymentMethods: Joi.array().items(Joi.string()).optional(),
    ratings: Joi.object({
        average: Joi.number().optional(),
        count: Joi.number().optional()
    }).optional()
};

const createRestaurantSchema = Joi.object({
    identifier: Joi.string().required(),
}).concat(Joi.object(restaurantSchema)).unknown(false);

const updateRestaurantSchema = Joi.object(restaurantSchema).unknown(false);

const adminSchema = {
    ...defaultUserSchema,
    role: Joi.string().valid(...ADMIN_TYPES).required(),
    permissions: Joi.array().items(Joi.string()).optional(),
};

const createAdminSchema = Joi.object({
    identifier: Joi.string().required(),
}).concat(Joi.object(adminSchema)).unknown(false);

const updateAdminSchema = Joi.object(adminSchema).unknown(false);

const userByIdSchema = Joi.object({
    id: Joi.alternatives().try(
        Joi.string().trim().lowercase().email(),
        Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
    ).required(),
    category: Joi.string().valid(...Object.values(USER_CATEGORIES)).required()
}).unknown(false);

const validateCreateUser = (req, res, next) => {
    const payload = req.body;
    const { category } = req.params;
    if (!Object.values(USER_CATEGORIES).includes(category)) {
        next(new BadRequestException('Invalid user category'));
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
            return next(new BadRequestException('Invalid user category'));
    }
    const { error } = schema.validate(payload, { abortEarly: false });
    if (error) {
        return next(new BadRequestException(error.details.map((err) => err.message).join(', ')));
    }
    return next();
};

const validateUpdateUser = (req, res, next) => {
    const payload = req.body;
    const { category } = req.params;

    const { error: paramsError } = userByIdSchema.validate(req.params, { abortEarly: false });
    if (paramsError) {
        return next(new BadRequestException(paramsError.details.map((err) => err.message).join(', ')));
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
            return new BadRequestException('Invalid user category');
    }
    const { error: payloadError } = schema.validate(payload, { abortEarly: false });
    if (payloadError) {
        return next(new BadRequestException(payloadError.details.map((err) => err.message).join(', ')));
    }
    return next();
}

const validateGetAllUsers = (req, res, next) => {
    const { category } = req.params;
    if (!Object.values(USER_CATEGORIES).includes(category)) {
        return next(new BadRequestException('Invalid user category'));
    }
    return next();
};

const validateGetUserByIdentifier = (req, res, next) => {
    const { error } = userByIdSchema.validate(req.params, { abortEarly: false });
    if (error) {
        return next(new BadRequestException(error.details.map((err) => err.message).join(', ')));
    }
    return next();
};

const validateDeleteUserAccountByIdentifier = (req, res, next) => {
    const { error } = userByIdSchema.validate(req.params, { abortEarly: false });
    if (error) {
        return next(new BadRequestException(error.details.map((err) => err.message).join(', ')));
    }
    return next();
}

const validateAccountStatusUpdateUserByIdentifier = (req, res, next) => {
    const { error } = userByIdSchema.validate(req.params, { abortEarly: false });
    if (error) {
        return next(new BadRequestException(error.details.map((err) => err.message).join(', ')));
    }
    if (!req.body.status) {
        return next(new BadRequestException('Status is required'));
    }
    if (!Object.values(USER_ACCOUNT_STATUS).includes(req.body.status)) {
        return next(new BadRequestException('Invalid status'));
    }
    return next();
}


module.exports = { validateCreateUser, validateGetAllUsers, validateGetUserByIdentifier, validateUpdateUser, validateAccountStatusUpdateUserByIdentifier, validateDeleteUserAccountByIdentifier };