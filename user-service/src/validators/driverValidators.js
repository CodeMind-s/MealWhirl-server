const Joi = require('joi');
const BadRequestException = require('../exceptions/BadRequestException');

const vehicleValidator = Joi.object({
    identifier: Joi.string().required().messages({
        'any.required': 'Driver identifier is required',
    }),
    type: Joi.string().required().messages({
        'any.required': 'Vehicle type is required',
    }),
    brand: Joi.string().required().trim().messages({
        'any.required': 'Vehicle brand is required',
    }),
    model: Joi.string().trim().allow(null, '').messages({
        'string.base': 'Model must be a string',
    }),
    licensePlate: Joi.string().required().trim().messages({
        'any.required': 'License plate is required',
    }),
    vehicleInsurance: Joi.object({
        policyNumber: Joi.string().required().trim().messages({
            'any.required': 'Policy number is required',
        }),
        vendor: Joi.string().required().trim().messages({
            'any.required': 'Insurance vendor is required',
        }),
    }).required().messages({
        'any.required': 'Vehicle insurance is required',
    }),
    images: Joi.object({
        front: Joi.string().required().messages({
            'any.required': 'Front image is required',
        }),
        back: Joi.string().required().messages({
            'any.required': 'Back image is required',
        }),
        side: Joi.string().required().messages({
            'any.required': 'Side image is required',
        }),
    }).required().messages({
        'any.required': 'Vehicle images are required',
    }),
});

const validateAddUpdateVehicle = (req, res, next) => {
    const { error } = vehicleValidator.validate(req.body, { abortEarly: false });
    if (error) {
        next(new BadRequestException(error.details.map((err) => err.message).join(', ')));
    }
    next();
};

module.exports = {
    validateAddUpdateVehicle
};