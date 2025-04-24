const express = require('express');
const logger = require('../utils/logger');
const router = express.Router();
const { sendMessageWithResponse } = require('../services/kafkaService');

router.post('/', async (req, res) => {
  logger.info(`{POST api/v1/payments} Received request to create transaction for userId: ${req.body.userId}`);
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
    const paymentResult = await sendMessageWithResponse('payment-request', {
      action: 'createTransaction',
      payload: req.body
    });
    
    logger.info(`{POST api/v1/payments} Transaction created successfully for userId: ${req.body.userId}, transactionId: ${paymentResult.trasactionId || 'N/A'}`);
    return res.status(201).json(paymentResult);
  } catch (error) {
    logger.error(`{POST api/v1/payments} Error creating transaction for userId: ${req.body.userId} - ${error.message}`);
    return res.status(500).json({ 
      message: error.message || 'Error creating transaction' 
    });
  }
});

/**
 * @route GET /api/v1/payments
 * @desc Get all transactions
 * @access Public
 */
router.get('/', async (req, res) => {
  logger.info(`{GET api/v1/payments} Received request to get all payments`);
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
    const paymentResult = await sendMessageWithResponse('payment-request', {
      action: 'getAllTransactions',
      payload: {}
    });
    
    if (!paymentResult || paymentResult.length === 0) {
      logger.warn(`{GET api/v1/payments} No payments found`);
      return res.status(404).json({ message: 'No payments found' });
    }

    logger.info(`{GET api/v1/payments} Payments fetched successfully`);
    return res.status(200).json(paymentResult);
  } catch (error) {
    logger.error(`{GET api/v1/payments} Error fetching payments - ${error.message}`);
    return res.status(500).json({ 
      message: error.message || 'Error fetching payments' 
    });
  }
});

/**
 * @route GET /api/v1/payments/user/:id
 * @desc Get all payments placed by a specific user
 * @access Public
 */
router.get('/user/:id', async (req, res) => {
  logger.info(`{GET api/v1/payments/user/:id} Received request to get all payments for userId: ${req.params.id}`);
  try {
    // First, validate that the user exists
    // const userValidation = await sendMessageWithResponse('user-request', {
    //   action: 'getUser',
    //   payload: { userId: req.params.id }
    // });

    // logger.info(`{GET api/v1/payments/user/:id} User validated: ${req.params.id}. Fetching payments...`);
    
    // if (!userValidation.user) {
    //   logger.warn(`{GET api/v1/payments} User not found: ${req.params.id}`);
    //   return res.status(404).json({ message: 'User not found' });
    // }
    
    // If user exists, create the order
    const paymentResult = await sendMessageWithResponse('payment-request', {
      action: 'getTransactionsByUserId',
      payload: { userId: req.params.id }
    });
    
    logger.info(`{GET api/v1/payments/user/:id} payments fetched successfully for userId: ${req.params.id}`);
    return res.status(200).json(paymentResult);
  } catch (error) {
    logger.error(`{GET api/v1/payments/user/:id} Error fetching payments for userId: ${req.params.id} - ${error.message}`);
    return res.status(500).json({ 
      message: error.message || 'Error fetching payments' 
    });
  }
});

/**
 * @route GET /api/v1/payments/:id
 * @desc Get payment by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    logger.info(`{GET api/v1/payments/:id} Received request to fetch payment with ID: ${req.params.id}`);
    const paymentResult = await sendMessageWithResponse('payment-request', {
      action: 'getTransactionById',
      payload: { id: req.params.id }
    });
    
    if (!paymentResult) {
      logger.warn(`{GET api/v1/payments/:id} payment not found: ${req.params.id}`);
      return res.status(404).json({ message: 'payment not found' });
    }

    logger.info(`{GET api/v1/payments/:id} payment fetched successfully: ${req.params.id}`);
    return res.status(200).json(paymentResult);
  } catch (error) {
    logger.error(`{GET api/v1/payments/:id} Error fetching payment with ID: ${req.params.id} - ${error.message}`);
    // Handle specific error types if needed
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error fetching payment' 
    });
  }
});

/**
 * @route PATCH /api/v1/payments/:id
 * @desc Update payment status by ID
 * @access Public
 */
router.patch('/:id', async (req, res) => {
  try {
    logger.info(`{PATCH api/v1/payments/:id} Received request to update payment status for ID: ${req.params.id}`);
    const paymentResult = await sendMessageWithResponse('payment-request', {
      action: 'updateTransactionStatus',
      payload: { id: req.params.id, transactionStatus: req.body.transactionStatus }
    });
    
    if (!paymentResult) {
      logger.warn(`{PATCH api/v1/payments/:id} Order not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    logger.info(`{PATCH api/v1/payments/:id} Order status updated successfully: ${req.params.id}`);
    return res.status(200).json(paymentResult);
  } catch (error) {
    logger.error(`{PATCH api/v1/payments/:id} Error updating payment status for ID: ${req.params.id} - ${error.message}`);
    // Handle specific error types if needed
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error updating payment status'
    });
  }
});

/**
 * @route DELETE /api/v1/payments/:id
 * @desc Delete payment by ID
 * @access Public
 */
router.delete('/:id', async (req, res) => {
  try {
    logger.info(`{DELETE api/v1/payments/:id} Received request to delete payment with ID: ${req.params.id}`);
    const PaymentResult = await sendMessageWithResponse('payment-request', {
      action: 'deleteTransaction',
      payload: { id: req.params.id }
    });
    
    if (!PaymentResult) {
      logger.warn(`{DELETE api/v1/payments/:id} Payment not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Payment not found' });
    }

    logger.info(`{DELETE api/v1/payments/:id} Payment deleted successfully: ${req.params.id}`);
    return res.status(200).json(PaymentResult);
  } catch (error) {
    logger.error(`{DELETE api/v1/payments/:id} Error deleting payment with ID: ${req.params.id} - ${error.message}`);
    // Handle specific error types if needed
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error deleting order'
    });
  }
}
);

module.exports = router;