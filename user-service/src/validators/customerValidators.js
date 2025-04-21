const Joi = require('joi');
const { validate } = require('../models/userModel');

const paymentValidator = Joi.object({
    identifier: Joi.string().required().messages({
        'any.required': 'Customer ID is required',
        'string.base': 'Customer ID must be a string',
    }),
    cardNumber: Joi.string()
        .trim()
        .pattern(/^\d{16}$/)
        .required()
        .messages({
            'any.required': 'Card number is required',
            'string.pattern.base': 'Card number must be 16 digits',
            'string.base': 'Card number must be a string',
        }),
    cardHolderName: Joi.string().trim().required().messages({
        'any.required': 'Card holder name is required',
        'string.base': 'Card holder name must be a string',
    }),
    expiryDate: Joi.string()
        .pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
        .required()
        .messages({
            'any.required': 'Expiry date is required',
            'string.pattern.base': 'Expiry date must be in MM/YY format',
            'string.base': 'Expiry date must be a string',
        }),
    cvv: Joi.string()
        .pattern(/^\d{3,4}$/)
        .required()
        .messages({
            'any.required': 'CVV is required',
            'string.pattern.base': 'CVV must be 3 or 4 digits',
            'string.base': 'CVV must be a string',
        }),
    isDefault: Joi.boolean().optional().messages({
        'boolean.base': 'isDefault must be a boolean',
    })
});

const validatePaymentMethod = (req, res, next) => {
    const { error } = paymentValidator.validate(req.body, { abortEarly: false });
    if (error) {
        return next(new BadRequestException(error.details.map((err) => err.message).join(', ')));
    }
    next();
}

module.exports = {
    validatePaymentMethod,
};
