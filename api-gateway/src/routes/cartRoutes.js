const express = require('express');
const logger = require('../utils/logger');
const router = express.Router();
const { sendMessageWithResponse } = require('../services/kafkaService');

/**
 * @route POST /api/v1/carts
 * @desc Create a new cart
 * @access Public
 */
router.post('/', async (req, res) => {
  logger.info(`{POST api/v1/carts} Received request to create cart for userId: ${req.body.userId}`);
  try {
    // Validate required fields
    const { userId, restaurantId, item } = req.body;
    if (!userId || !restaurantId || !item) {
      logger.error(`{POST api/v1/carts} Missing required fields for userId: ${req.body.userId}`);
      return res.status(400).json({ message: 'Missing required fields: userId, restaurantId, item' });
    }

    const cartResult = await sendMessageWithResponse('cart-request', {
      action: 'addToCart',
      payload: req.body
    });

    logger.info(`{POST api/v1/carts} Cart created successfully for userId: ${req.body.userId}, cartId: ${cartResult.cartId || 'N/A'}`);
    return res.status(201).json(cartResult);
  } catch (error) {
    logger.error(`{POST api/v1/carts} Error creating cart for userId: ${req.body.userId} - ${error.message}`);
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error creating cart' 
    });
  }
});

/**
 * @route GET /api/v1/carts
 * @desc Get all carts
 * @access Public
 */
router.get('/', async (req, res) => {
  logger.info(`{GET api/v1/carts} Received request to get all carts`);
  try {
    const cartResult = await sendMessageWithResponse('cart-request', {
      action: 'getAllCarts',
      payload: {}
    });

    if (!cartResult) {
      logger.warn(`{GET api/v1/carts} No carts found`);
      return res.status(404).json({ message: 'No carts found' });
    }

    logger.info(`{GET api/v1/carts} Carts fetched successfully`);
    return res.status(200).json(cartResult);
  } catch (error) {
    logger.error(`{GET api/v1/carts} Error fetching carts - ${error.message}`);
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error fetching carts' 
    });
  }
});

/**
 * @route GET /api/v1/carts/user/:id
 * @desc Get cart for a specific user
 * @access Public
 */
router.get('/user/:id', async (req, res) => {
  logger.info(`{GET api/v1/carts/user/:id} Received request to get cart for userId: ${req.params.id}`);
  try {
    const cartResult = await sendMessageWithResponse('cart-request', {
      action: 'getCartByUserId',
      payload: { userId: req.params.id }
    });

    if (!cartResult) {
      logger.warn(`{GET api/v1/carts/user/:id} Cart not found for userId: ${req.params.id}`);
      return res.status(404).json({ message: 'Cart not found' });
    }

    logger.info(`{GET api/v1/carts/user/:id} Cart fetched successfully for userId: ${req.params.id}`);
    return res.status(200).json(cartResult);
  } catch (error) {
    logger.error(`{GET api/v1/carts/user/:id} Error fetching cart for userId: ${req.params.id} - ${error.message}`);
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error fetching cart' 
    });
  }
});

/**
 * @route GET /api/v1/carts/:id
 * @desc Get cart by cart ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  logger.info(`{GET api/v1/carts/:id} Received request to fetch cart with ID: ${req.params.id}`);
  try {
    const cartResult = await sendMessageWithResponse('cart-request', {
      action: 'getCartById',
      payload: { id: req.params.id }
    });

    if (!cartResult) {
      logger.warn(`{GET api/v1/carts/:id} Cart not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Cart not found' });
    }

    logger.info(`{GET api/v1/carts/:id} Cart fetched successfully: ${req.params.id}`);
    return res.status(200).json(cartResult);
  } catch (error) {
    logger.error(`{GET api/v1/carts/:id} Error fetching cart with ID: ${req.params.id} - ${error.message}`);
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error fetching cart' 
    });
  }
});

/**
 * @route PATCH /api/v1/carts/:id
 * @desc Update cart by ID
 * @access Public
 */
router.patch('/:id', async (req, res) => {
  logger.info(`{PATCH api/v1/carts/:id} Received request to update cart with ID: ${req.params.id}`);
  try {
    const cartResult = await sendMessageWithResponse('cart-request', {
      action: 'updateCartItem',
      payload: { id: req.params.id, updates: req.body }
    });

    if (!cartResult) {
      logger.warn(`{PATCH api/v1/carts/:id} Cart not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Cart not found' });
    }

    logger.info(`{PATCH api/v1/carts/:id} Cart updated successfully: ${req.params.id}`);
    return res.status(200).json(cartResult);
  } catch (error) {
    logger.error(`{PATCH api/v1/carts/:id} Error updating cart with ID: ${req.params.id} - ${error.message}`);
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error updating cart' 
    });
  }
});


/**
 * @route DELETE /api/v1/carts/:id
 * @desc Delete cart by ID
 * @access Public
 */
router.delete('/:id', async (req, res) => {
  logger.info(`{DELETE api/v1/carts/:id} Received request to delete cart with ID: ${req.params.id}`);
  try {
    await sendMessageWithResponse('cart-request', {
      action: 'deleteCart',
      payload: { id: req.params.id }
    });

    logger.info(`{DELETE api/v1/carts/:id} Cart deleted successfully: ${req.params.id}`);
    return res.status(200).json({ message: 'Cart deleted successfully' });
  } catch (error) {
    logger.error(`{DELETE api/v1/carts/:id} Error deleting cart with ID: ${req.params.id} - ${error.message}`);
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error deleting cart' 
    });
  }
});

/**
 * @route PATCH /api/v1/carts/:id/items
 * @desc Remove specific items from a cart
 * @access Public
 */
router.patch('/items/:id', async (req, res) => {
  logger.info(`{PATCH api/v1/carts/items/:id} Received request to remove cart items ${req.body.menuItemId} with ID: ${req.params.id}`);
  try {
    const cartResult = await sendMessageWithResponse('cart-request', {
      action: 'removeItemFromCart',
      payload: { id: req.params.id, updates: req.body }
    });

    if (!cartResult) {
      logger.warn(`{PATCH api/v1/carts/items/:id} Cart not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Cart not found' });
    }

    logger.info(`{PATCH api/v1/carts/items/:id} Cart items removed successfully: ${req.params.id}`);
    return res.status(200).json(cartResult);
  } catch (error) {
    logger.error(`{PATCH api/v1/carts/items/:id} Error removing cart items with ID: ${req.params.id} - ${error.message}`);
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error removing cart items' 
    });
  }
});

/**
 * @route PATCH /api/v1/carts/active-restaurant
 * @desc Set the active restaurant for a user's cart
 * @access Public
 */
router.patch('/active-restaurant', async (req, res) => {
  logger.info(`{PATCH api/v1/carts/active-restaurant} Received request to set active restaurant for userId: ${req.body.userId}`);
  try {
    // Validate required fields
    const { userId, restaurantId } = req.body;
    if (!userId || !restaurantId) {
      logger.error(`{PATCH api/v1/carts/active-restaurant} Missing required fields for userId: ${req.body.userId}`);
      return res.status(400).json({ message: 'Missing required fields: userId, restaurantId' });
    }

    const cartResult = await sendMessageWithResponse('cart-request', {
      action: 'setActiveRestaurant',
      payload: { userId, restaurantId }
    });

    if (!cartResult) {
      logger.warn(`{PATCH api/v1/carts/active-restaurant} Cart not found for userId: ${req.body.userId}`);
      return res.status(404).json({ message: 'Cart not found' });
    }

    logger.info(`{PATCH api/v1/carts/active-restaurant} Active restaurant set successfully for userId: ${req.body.userId}, restaurantId: ${req.body.restaurantId}`);
    return res.status(200).json(cartResult);
  } catch (error) {
    logger.error(`{PATCH api/v1/carts/active-restaurant} Error setting active restaurant for userId: ${req.body.userId} - ${error.message}`);
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error setting active restaurant' 
    });
  }
});

module.exports = router;