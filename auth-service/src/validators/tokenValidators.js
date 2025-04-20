const Joi = require('joi');
const { USER_IDENTIFIER_TYPES } = require('../constants/userConstants');

const loginSchema = Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string().required()
}).unknown(false);

const registerSchema = Joi.object({
    type: Joi.string().valid(...Object.values(USER_IDENTIFIER_TYPES)).required(),
    password: Joi.string().required(),
    email: Joi.when('type', {
        is: USER_IDENTIFIER_TYPES.EMAIL,
        then: Joi.string().trim().lowercase().email().required(),
        otherwise: Joi.string().optional()
    }),
    phone: Joi.when('type', {
        is: USER_IDENTIFIER_TYPES.PHONE,
        then: Joi.string().required(),
        otherwise: Joi.string().optional()
    })
}).xor(USER_IDENTIFIER_TYPES.EMAIL, USER_IDENTIFIER_TYPES.PHONE).unknown(false);

const validateRegister = (req, res, next) => {
    const payload = req.body;
    const { error } = registerSchema.validate(payload, { abortEarly: false });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    return next();
};

const validateLogin = (req, res, next) => {
    const payload = req.body;
    const { error } = loginSchema.validate(payload, { abortEarly: false });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    return next();
};

module.exports = { validateLogin, validateRegister }