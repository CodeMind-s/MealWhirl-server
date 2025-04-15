const express = require('express');
const logger = require('../utils/logger');
const router = express.Router();
const { sendMessageWithResponse } = require('../services/kafkaService');

/**
 * @route POST /api/v1/orders
 * @desc Create a new order
 * @access Public
 */
router.post('/', async (req, res) => {
  logger.info(`{POST api/v1/orders} Received request to create order for userId: ${req.body.userId}`);
  try {
    // First, validate that the user exists
    // const userValidation = await sendMessageWithResponse('user-request', {
    //   action: 'getUser',
    //   payload: { userId: req.body.userId }
    // });
    // logger.info(`{POST api/v1/orders} User validated: ${req.body.userId}. Creating order...`);
    
    // if (!userValidation.user) {
    //   logger.warn(`{POST api/v1/orders} User not found: ${req.body.userId}`);
    //   return res.status(404).json({ message: 'User not found' });
    // }
    
    // If user exists, create the order
    const orderResult = await sendMessageWithResponse('order-request', {
      action: 'createOrder',
      payload: req.body
    });
    
    logger.info(`{POST api/v1/orders} Order created successfully for userId: ${req.body.userId}, orderId: ${orderResult.orderId || 'N/A'}`);
    return res.status(201).json(orderResult);
  } catch (error) {
    logger.error(`{POST api/v1/orders} Error creating order for userId: ${req.body.userId} - ${error.message}`);
    return res.status(500).json({ 
      message: error.message || 'Error creating order' 
    });
  }
});

/**
 * @route GET /api/v1/orders
 * @desc Get all orders
 * @access Public
 */
router.get('/', async (req, res) => {
  logger.info(`{GET api/v1/orders} Received request to get all orders`);
  try {
    // First, validate that the user exists
    // const userValidation = await sendMessageWithResponse('user-request', {
    //   action: 'getUser',
    //   payload: { userId: req.params.id }
    // });

    // logger.info(`{GET api/v1/orders/user/:id} User validated: ${req.params.id}. Fetching orders...`);
    
    // if (!userValidation.user) {
    //   logger.warn(`{GET api/v1/orders} User not found: ${req.params.id}`);
    //   return res.status(404).json({ message: 'User not found' });
    // }
    
    // If user exists, create the order
    const orderResult = await sendMessageWithResponse('order-request', {
      action: 'getAllOrders',
      payload: {}
    });
    
    if (!orderResult) {
      logger.warn(`{GET api/v1/orders} No orders found`);
      return res.status(404).json({ message: 'No orders found' });
    }

    logger.info(`{GET api/v1/orders} Orders fetched successfully`);
    return res.status(200).json(orderResult);
  } catch (error) {
    logger.error(`{GET api/v1/orders} Error fetching orders - ${error.message}`);
    return res.status(500).json({ 
      message: error.message || 'Error fetching orders' 
    });
  }
});

/**
 * @route GET /api/v1/orders/user/:id
 * @desc Get all orders placed by a specific user
 * @access Public
 */
router.get('/user/:id', async (req, res) => {
  logger.info(`{GET api/v1/orders/user/:id} Received request to get all orders for userId: ${req.params.id}`);
  try {
    // First, validate that the user exists
    // const userValidation = await sendMessageWithResponse('user-request', {
    //   action: 'getUser',
    //   payload: { userId: req.params.id }
    // });

    // logger.info(`{GET api/v1/orders/user/:id} User validated: ${req.params.id}. Fetching orders...`);
    
    // if (!userValidation.user) {
    //   logger.warn(`{GET api/v1/orders} User not found: ${req.params.id}`);
    //   return res.status(404).json({ message: 'User not found' });
    // }
    
    // If user exists, create the order
    const orderResult = await sendMessageWithResponse('order-request', {
      action: 'getOrdersByUserId',
      payload: { userId: req.params.id }
    });
    
    logger.info(`{GET api/v1/orders/user/:id} Orders fetched successfully for userId: ${req.params.id}`);
    return res.status(200).json(orderResult);
  } catch (error) {
    logger.error(`{GET api/v1/orders/user/:id} Error fetching orders for userId: ${req.params.id} - ${error.message}`);
    return res.status(500).json({ 
      message: error.message || 'Error fetching orders' 
    });
  }
});

/**
 * @route GET /api/v1/orders/restaurant/:id
 * @desc Get all orders for a specific restaurant
 * @access Public
 */
router.get('/restaurant/:id', async (req, res) => {
  logger.info(`{GET api/v1/orders/restaurant/:id} Received request to get all orders for restaurantId: ${req.params.id}`);
  try {
    // First, validate that the user exists
    // const Validation = await sendMessageWithResponse('user-request', {
    //   action: 'getUser',
    //   payload: { userId: req.params.id }
    // });

    // logger.info(`{GET api/v1/orders/user/:id} User validated: ${req.params.id}. Fetching orders...`);
    
    // if (!userValidation.user) {
    //   logger.warn(`{GET api/v1/orders} User not found: ${req.params.id}`);
    //   return res.status(404).json({ message: 'User not found' });
    // }
    
    // If user exists, create the order
    const orderResult = await sendMessageWithResponse('order-request', {
      action: 'getOrdersByRestaurantId',
      payload: { restaurantId: req.params.id }
    });
    
    logger.info(`{GET api/v1/orders/restaurant/:id} Orders fetched successfully for restaurantId: ${req.params.id}`);
    return res.status(200).json(orderResult);
  } catch (error) {
    logger.error(`{GET api/v1/orders/restaurant/:id} Error fetching orders for restaurantId: ${req.params.id} - ${error.message}`);
    return res.status(500).json({ 
      message: error.message || 'Error fetching orders' 
    });
  }
});

/**
 * @route GET /api/v1/orders/delivery/:id
 * @desc Get all orders assigned to a specific delivery person
 * @access Public
 */
router.get('/delivery/:id', async (req, res) => {
  logger.info(`{GET api/v1/orders/delivery/:id} Received request to get all orders for deliveryPersonId: ${req.params.id}`);
  try {
    // First, validate that the user exists
    // const Validation = await sendMessageWithResponse('user-request', {
    //   action: 'getUser',
    //   payload: { userId: req.params.id }
    // });

    // logger.info(`{GET api/v1/orders/user/:id} User validated: ${req.params.id}. Fetching orders...`);
    
    // if (!userValidation.user) {
    //   logger.warn(`{GET api/v1/orders} User not found: ${req.params.id}`);
    //   return res.status(404).json({ message: 'User not found' });
    // }
    
    // If user exists, create the order
    const orderResult = await sendMessageWithResponse('order-request', {
      action: 'getOrdersByDeliveryPersonId',
      payload: { deliveryPersonId: req.params.id }
    });
    
    logger.info(`{GET api/v1/orders/delivery/:id} Orders fetched successfully for deliveryPersonId: ${req.params.id}`);
    return res.status(200).json(orderResult);
  } catch (error) {
    logger.error(`{GET api/v1/orders/delivery/:id} Error fetching orders for deliveryPersonId: ${req.params.id} - ${error.message}`);
    return res.status(500).json({ 
      message: error.message || 'Error fetching orders' 
    });
  }
});

/**
 * @route GET /api/v1/orders/:id
 * @desc Get order by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    logger.info(`{GET api/v1/orders/:id} Received request to fetch order with ID: ${req.params.id}`);
    const orderResult = await sendMessageWithResponse('order-request', {
      action: 'getOrderById',
      payload: { id: req.params.id }
    });
    
    if (!orderResult) {
      logger.warn(`{GET api/v1/orders/:id} Order not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    logger.info(`{GET api/v1/orders/:id} Order fetched successfully: ${req.params.id}`);
    return res.status(200).json(orderResult);
  } catch (error) {
    logger.error(`{GET api/v1/orders/:id} Error fetching order with ID: ${req.params.id} - ${error.message}`);
    // Handle specific error types if needed
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error fetching order' 
    });
  }
});

/**
 * @route PATCH /api/v1/orders/:id
 * @desc Update order status by ID
 * @access Public
 */
router.patch('/:id', async (req, res) => {
  try {
    logger.info(`{PATCH api/v1/orders/:id} Received request to update order status for ID: ${req.params.id}`);
    const orderResult = await sendMessageWithResponse('order-request', {
      action: 'updateOrderStatus',
      payload: { id: req.params.id, orderStatus: req.body.orderStatus }
    });
    
    if (!orderResult) {
      logger.warn(`{PATCH api/v1/orders/:id} Order not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    logger.info(`{PATCH api/v1/orders/:id} Order status updated successfully: ${req.params.id}`);
    return res.status(200).json(orderResult);
  } catch (error) {
    logger.error(`{PATCH api/v1/orders/:id} Error updating order status for ID: ${req.params.id} - ${error.message}`);
    // Handle specific error types if needed
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error updating order status'
    });
  }
});

/**
 * @route PATCH /api/v1/orders/delivery/:id
 * @desc Assign a delivery person to the order
 * @access Public
 */
router.patch('/delivery/:id', async (req, res) => {
  try {
    logger.info(`{PATCH api/v1/orders/assignDeliveryPerson/:id} Received request to assign delivery person for order ID: ${req.params.id}`);
    const orderResult = await sendMessageWithResponse('order-request', {
      action: 'assignDeliveryPerson',
      payload: { id: req.params.id, deliveryPersonId: req.body.deliveryPersonId }
    });
    
    if (!orderResult) {
      logger.warn(`{PATCH api/v1/orders/assignDeliveryPerson/:id} Order not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!orderResult.deliveryPersonId) {
      logger.warn(`{PATCH api/v1/orders/assignDeliveryPerson/:id} Delivery person not found for order ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Delivery person not found' });
    }

    logger.info(`{PATCH api/v1/orders/assignDeliveryPerson/:id} Order delivery person assigned successfully: ${req.params.id}`);
    return res.status(200).json(orderResult);
  } catch (error) {
    logger.error(`{PATCH api/v1/orders/assignDeliveryPerson/:id} Error assigning delivery person for order ID: ${req.params.id} - ${error.message}`);
    // Handle specific error types if needed
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error assigning delivery person'
    });
  }
});

/**
 * @route DELETE /api/v1/orders/:id
 * @desc Delete order by ID
 * @access Public
 */
router.delete('/:id', async (req, res) => {
  try {
    logger.info(`{DELETE api/v1/orders/:id} Received request to delete order with ID: ${req.params.id}`);
    const orderResult = await sendMessageWithResponse('order-request', {
      action: 'deleteOrder',
      payload: { id: req.params.id }
    });
    
    if (!orderResult) {
      logger.warn(`{DELETE api/v1/orders/:id} Order not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    logger.info(`{DELETE api/v1/orders/:id} Order deleted successfully: ${req.params.id}`);
    return res.status(200).json(orderResult);
  } catch (error) {
    logger.error(`{DELETE api/v1/orders/:id} Error deleting order with ID: ${req.params.id} - ${error.message}`);
    // Handle specific error types if needed
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error deleting order'
    });
  }
}
);

module.exports = router;