const Joi = require("joi");
const BadRequestException = require("../exceptions/BadRequestException");

const menuItemValidator = Joi.object({
  identifier: Joi.string().required().messages({
    "string.base": "Identifier must be a string.",
    "string.empty": "Identifier is required.",
    "any.required": "Identifier is required.",
  }),
  menu: Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
      "string.base": "Menu item name must be a string.",
      "string.empty": "Menu item name is required.",
      "string.min": "Menu item name must be at least 3 characters long.",
      "string.max": "Menu item name must not exceed 50 characters.",
      "any.required": "Menu item name is required.",
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
        "string.min": "Each dietary restriction must have at least 1 character.",
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
      "object.base": "Menu must be an object.",
      "any.required": "Menu is required.",
    }),
});

const getMenuItemValidator = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Identifier must be a string.",
    "string.empty": "Identifier is required.",
    "any.required": "Identifier is required.",
  }),
  menuId: Joi.string().required().messages({
    "string.base": "Menu item name must be a string.",
    "string.empty": "Menu item name is required.",
    "any.required": "Menu item name is required.",
  }),
});

const validateGetMenuItem = (req, res, next) => { 
const { error } = getMenuItemValidator.validate(req.params, { abortEarly: false }); 
  if (error) { 
    return next( 
      new BadRequestException( 
        error.details.map((err) => err.message).join(", ") 
      ) 
    ); 
  }
  next();
};

const validateMenuItem = (req, res, next) => {
  const { error } = menuItemValidator.validate(req.body, { abortEarly: false });
  if (error) {
    return next(
      new BadRequestException(
        error.details.map((err) => err.message).join(", ")
      )
    );
  }
  next();
};

module.exports = {
    validateMenuItem,
    validateGetMenuItem
};
