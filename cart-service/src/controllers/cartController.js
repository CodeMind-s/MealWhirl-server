const Cart = require("../models/cartModel");
const logger = require("../utils/logger");
const { produceMessage } = require("../services/kafkaService");

/**
 * Retrieves all carts from the database.
 */
exports.getAllCarts = async () => {
  try {
    logger.info(`[CART_SERVICE] {action:getAllCarts, status:init} Fetching all carts`);
    const carts = await Cart.find({});
    
    if (!carts || carts.length === 0) {
      logger.info(`[CART_SERVICE] {action:getAllCarts, status:success} No carts found`);
      return null;
    }
    
    logger.info(`[CART_SERVICE] {action:getAllCarts, status:success} Found ${carts.length} carts`);
    return carts;
  } catch (error) {
    logger.error(`[CART_SERVICE] {action:getAllCarts, status:error} ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Fetches a cart by its ID.
 */
exports.getCartById = async (cartId) => {
  try {
    logger.info(`[CART_SERVICE] {action:getCartById, status:init} Fetching cart by ID: ${cartId}`);
    
    if (!cartId) {
      logger.error(`[CART_SERVICE] {action:getCartById, status:failed} Cart ID is required`);
      const error = new Error("Cart ID is required");
      error.statusCode = 400;
      throw error;
    }

    const cart = await Cart.findById(cartId);

    if (!cart) {
      logger.error(`[CART_SERVICE] {action:getCartById, status:failed} Cart not found: ${cartId}`);
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    logger.info(`[CART_SERVICE] {action:getCartById, status:success} Cart fetched: ${cartId}`);
    return cart;
  } catch (error) {
    logger.error(`[CART_SERVICE] {action:getCartById, status:error} ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Fetches the cart for a specific user.
 */
exports.getCartByUserId = async (userId) => {
  try {
    logger.info(`[CART_SERVICE] {action:getCartByUserId, status:init} Fetching cart for user: ${userId}`);
    
    if (!userId) {
      logger.error(`[CART_SERVICE] {action:getCartByUserId, status:failed} User ID is required`);
      const error = new Error("User ID is required");
      error.statusCode = 400;
      throw error;
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      logger.info(`[CART_SERVICE] {action:getCartByUserId, status:success} No cart found for user: ${userId}`);
      return null;
    }

    logger.info(`[CART_SERVICE] {action:getCartByUserId, status:success} Cart fetched for user: ${userId}`);
    return cart;
  } catch (error) {
    logger.error(`[CART_SERVICE] {action:getCartByUserId, status:error} ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Adds an item to a cart, creating the cart if it doesn't exist.
 */
// exports.addToCart = async (cartData) => {
//   try {
//     logger.info(`[CART_SERVICE] {action:addItemToCart, status:init} Adding item to cart`, cartData);

//     const { userId, restaurantId, item } = cartData;
//     const { menuItemId, name, price, quantity } = item || {};

//     if (!userId || !restaurantId || !menuItemId || !name || !price || !quantity) {
//       logger.error(`[CART_SERVICE] {action:addItemToCart, status:failed} Missing required fields`);
//       const error = new Error("Missing required fields: userId, restaurantId, menuItemId, name, price, quantity");
//       error.statusCode = 400;
//       throw error;
//     }

//     let cart = await Cart.findOne({ userId });

//     // Create new cart if doesn't exist
//     if (!cart) {
//       cart = new Cart({
//         userId,
//         itemsByRestaurant: new Map(),
//         totalItems: 0,
//         totalPrice: 0,
//       });
//       logger.info(`[CART_SERVICE] {action:addItemToCart, status:progress} Creating new cart for user: ${userId}`);
//     }

//     // Initialize restaurant data if not exists
//     if (!cart.itemsByRestaurant.has(restaurantId)) {
//       cart.itemsByRestaurant.set(restaurantId, {
//         restaurantId,
//         items: [],
//         subtotal: 0
//       });
//     }

//     const restaurantData = cart.itemsByRestaurant.get(restaurantId);
//     const existingItem = restaurantData.items.find(i => i.menuItemId === menuItemId);

//     // Calculate item total
//     const totalItemPrice = price * quantity;

//     if (existingItem) {
//       existingItem.quantity += quantity;
//       existingItem.totalItemPrice += totalItemPrice;
//     } else {
//       restaurantData.items.push({
//         menuItemId,
//         name,
//         price,
//         quantity,
//         totalItemPrice
//       });
//     }

//     // Update restaurant subtotal
//     restaurantData.subtotal += totalItemPrice;
//     cart.itemsByRestaurant.set(restaurantId, restaurantData);

//     // Update cart totals
//     cart.totalItems += quantity;
//     cart.totalPrice += totalItemPrice;
//     cart.lastUpdated = Date.now();

//     const updatedCart = await cart.save();

//     logger.info(`[CART_SERVICE] {action:addItemToCart, status:success} Item added to cart: ${updatedCart._id}`);

//     await produceMessage("cart-status", {
//       cartId: updatedCart._id.toString(),
//       userId,
//       action: "add_item",
//       timestamp: new Date().toISOString(),
//     });

//     return updatedCart;
//   } catch (error) {
//     logger.error(`[CART_SERVICE] {action:addItemToCart, status:error} ${error.message}`, { stack: error.stack });
//     throw error;
//   }
// };
exports.addToCart = async (cartData) => {
  try {
    logger.info(`[CART_SERVICE] {action:addItemToCart, status:init} Adding item to cart`, cartData);

    const { userId, restaurantId, item } = cartData;

    // Validate input fields early
    if (!userId || !restaurantId || !item) {
      logger.error(`[CART_SERVICE] {action:addItemToCart, status:failed} Missing required fields: userId, restaurantId, item`);
      const error = new Error("Missing required fields: userId, restaurantId, item");
      error.statusCode = 400;
      throw error;
    }

    const { menuItemId, name, price, quantity } = item;

    if (!menuItemId || !name || !price || !quantity || quantity < 1) {
      logger.error(`[CART_SERVICE] {action:addItemToCart, status:failed} Missing or invalid item fields`);
      const error = new Error("Missing or invalid item fields: menuItemId, name, price, quantity (must be >= 1)");
      error.statusCode = 400;
      throw error;
    }

    let cart = await Cart.findOne({ userId });

    // Create new cart if doesn't exist
    if (!cart) {
      cart = new Cart({
        userId,
        itemsByRestaurant: [],
        totalItems: 0,
        totalPrice: 0,
      });
      logger.info(`[CART_SERVICE] {action:addItemToCart, status:progress} Creating new cart for user: ${userId}`);
    }

    // Find restaurant data in the array
    let restaurantData = cart.itemsByRestaurant.find(r => r.restaurantId === restaurantId);

    // Initialize restaurant data (but don’t add to array yet)
    if (!restaurantData) {
      restaurantData = {
        restaurantId,
        items: [],
        subtotal: 0
      };
    }

    const existingItem = restaurantData.items.find(i => i.menuItemId === menuItemId);

    // Calculate item total
    const totalItemPrice = price * quantity;

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalItemPrice += totalItemPrice;
    } else {
      restaurantData.items.push({
        menuItemId,
        name,
        price,
        quantity,
        totalItemPrice
      });
    }

    // Update restaurant subtotal
    restaurantData.subtotal += totalItemPrice;

    // Only add restaurant to array if it’s not already there
    if (!cart.itemsByRestaurant.some(r => r.restaurantId === restaurantId)) {
      cart.itemsByRestaurant.push(restaurantData);
    }

    // Update cart totals
    cart.totalItems += quantity;
    cart.totalPrice += totalItemPrice;
    cart.lastUpdated = Date.now();

    // Remove empty restaurant entries before saving
    cart.itemsByRestaurant = cart.itemsByRestaurant.filter(r => r.items.length > 0);

    const updatedCart = await cart.save();

    logger.info(`[CART_SERVICE] {action:addItemToCart, status:success} Item added to cart: ${updatedCart._id}`);

    await produceMessage("cart-status", {
      cartId: updatedCart._id.toString(),
      userId,
      action: "add_item",
      timestamp: new Date().toISOString(),
    });

    return updatedCart;
  } catch (error) {
    logger.error(`[CART_SERVICE] {action:addItemToCart, status:error} ${error.message}`, { stack: error.stack });
    throw error;
  }
};

exports.updateCartItem = async (data) => {
  try {
    logger.info(`[CART_SERVICE] {action:updateCartItem, status:init} Updating cart items`, data);

    const { id } = data;
    const { restaurantId, menuItemId, quantity } = data.updates || {};

    // Validate input fields
    if (!id || !restaurantId || !menuItemId || quantity === undefined || quantity < 1) {
      logger.error(`[CART_SERVICE] {action:updateCartItem, status:failed} Missing or invalid fields`);
      const error = new Error("Missing or invalid fields: cartId, restaurantId, menuItemId, quantity (must be >= 1)");
      error.statusCode = 400;
      throw error;
    }

    const cart = await Cart.findById(id);
    if (!cart) {
      logger.error(`[CART_SERVICE] {action:updateCartItem, status:failed} Cart not found: ${id}`);
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    // Find the restaurant in the itemsByRestaurant array
    const restaurantData = cart.itemsByRestaurant.find(r => r.restaurantId === restaurantId);
    if (!restaurantData) {
      logger.error(`[CART_SERVICE] {action:updateCartItem, status:failed} Restaurant not found: ${restaurantId}`);
      const error = new Error("Restaurant not found in cart");
      error.statusCode = 404;
      throw error;
    }

    // Find the item in the restaurant's items array
    const itemData = restaurantData.items.find(i => i.menuItemId === menuItemId);
    if (!itemData) {
      logger.error(`[CART_SERVICE] {action:updateCartItem, status:failed} Item not found: ${menuItemId}`);
      const error = new Error("Item not found in restaurant");
      error.statusCode = 404;
      throw error;
    }

    // Calculate changes
    const oldQuantity = itemData.quantity;
    const quantityDelta = quantity - oldQuantity;
    const oldTotalItemPrice = itemData.totalItemPrice;
    const newTotalItemPrice = itemData.price * quantity;
    const totalPriceDelta = newTotalItemPrice - oldTotalItemPrice;

    // Update item data
    itemData.quantity = quantity;
    itemData.totalItemPrice = newTotalItemPrice;

    // Update restaurant subtotal
    restaurantData.subtotal += totalPriceDelta;

    // Update cart totals
    cart.totalItems += quantityDelta;
    cart.totalPrice += totalPriceDelta;
    cart.lastUpdated = Date.now();

    // Remove empty restaurant entries
    cart.itemsByRestaurant = cart.itemsByRestaurant.filter(r => r.items.length > 0);

    const updatedCart = await cart.save();

    logger.info(`[CART_SERVICE] {action:updateCartItem, status:success} Cart updated: ${id}`);

    return updatedCart;
  } catch (error) {
    logger.error(`[CART_SERVICE] {action:updateCartItem, status:error} ${error.message}`, { stack: error.stack });
    throw error;
  }
};


/**
 * Removes an item from the cart or clears the entire cart based on the payload type
 * @param {Object} payload - Contains cart ID and update information
 * @returns {Promise<Object>} Updated cart
 */
exports.removeItemFromCart = async (payload) => {
  const { id, updates } = payload;
  const { type, restaurantId, menuItemId } = updates;

  try {
    // Find the cart by ID
    const cart = await Cart.findById(id);
    if (!cart) {
      logger.warn(`removeItemFromCart: Cart not found with ID: ${id}`);
      throw new Error('Cart not found');
    }

    if (type === 'clear') {
      // Clear the entire cart
      cart.itemsByRestaurant = [];
      cart.totalItems = 0;
      cart.totalPrice = 0;
      cart.activeRestaurantId = null;
    } else if (type === 'item') {
      if (!restaurantId || !menuItemId) {
        throw new Error('restaurantId and menuItemId are required for item removal');
      }

      // Find the restaurant in the cart
      const restaurantIndex = cart.itemsByRestaurant.findIndex(
        item => item.restaurantId === restaurantId
      );

      if (restaurantIndex === -1) {
        logger.warn(`removeItemFromCart: Restaurant not found in cart: ${restaurantId}`);
        throw new Error('Restaurant not found in cart');
      }

      // Find the item to remove
      const itemIndex = cart.itemsByRestaurant[restaurantIndex].items.findIndex(
        item => item.menuItemId === menuItemId
      );

      if (itemIndex === -1) {
        logger.warn(`removeItemFromCart: Menu item not found: ${menuItemId}`);
        throw new Error('Menu item not found in cart');
      }

      // Get the item to calculate totals
      const itemToRemove = cart.itemsByRestaurant[restaurantIndex].items[itemIndex];

      // Remove the item
      cart.itemsByRestaurant[restaurantIndex].items.splice(itemIndex, 1);

      // Update restaurant subtotal
      cart.itemsByRestaurant[restaurantIndex].subtotal -= itemToRemove.totalItemPrice;

      // Update cart totals
      cart.totalItems -= itemToRemove.quantity;
      cart.totalPrice -= itemToRemove.totalItemPrice;

      // If no more items in this restaurant, remove the restaurant entry
      if (cart.itemsByRestaurant[restaurantIndex].items.length === 0) {
        cart.itemsByRestaurant.splice(restaurantIndex, 1);
        
        // If the active restaurant is the one being cleared, reset it
        if (cart.activeRestaurantId === restaurantId) {
          cart.activeRestaurantId = null;
        }
      }
    } else {
      throw new Error('Invalid type specified. Use "item" or "clear"');
    }

    // Update lastUpdated timestamp
    cart.lastUpdated = new Date();

    // Save the updated cart
    const updatedCart = await cart.save();
    logger.info(`removeItemFromCart: Cart updated successfully for ID: ${id}`);

    return updatedCart;
  } catch (error) {
    logger.error(`removeItemFromCart: Error processing cart update - ${error.message}`, {
      error: error.stack,
      payload
    });
    error.statusCode = 400; // Set appropriate status code
    throw error;
  }
};
/**
 * Deletes a cart by its ID.
 */
exports.deleteCart = async (cartId) => {
  try {
    logger.info(`[CART_SERVICE] {action:deleteCart, status:init} Deleting cart: ${cartId}`);

    if (!cartId) {
      logger.error(`[CART_SERVICE] {action:deleteCart, status:failed} Cart ID is required`);
      const error = new Error("Cart ID is required");
      error.statusCode = 400;
      throw error;
    }

    const cart = await Cart.findById(cartId);
    if (!cart) {
      logger.error(`[CART_SERVICE] {action:deleteCart, status:failed} Cart not found: ${cartId}`);
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    await Cart.findByIdAndDelete(cartId);

    logger.info(`[CART_SERVICE] {action:deleteCart, status:success} Cart deleted: ${cartId}`);

    await produceMessage("cart-status", {
      cartId,
      action: "delete_cart",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`[CART_SERVICE] {action:deleteCart, status:error} ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Sets the active restaurant for checkout
 */
// exports.setActiveRestaurant = async (userId, restaurantId) => {
//   try {
//     logger.info(`[CART_SERVICE] {action:setActiveRestaurant, status:init} Setting active restaurant for user: ${userId}`);

//     if (!userId || !restaurantId) {
//       logger.error(`[CART_SERVICE] {action:setActiveRestaurant, status:failed} Missing required fields`);
//       const error = new Error("Missing required fields: userId, restaurantId");
//       error.statusCode = 400;
//       throw error;
//     }

//     const cart = await Cart.findOne({ userId });
//     if (!cart) {
//       logger.error(`[CART_SERVICE] {action:setActiveRestaurant, status:failed} Cart not found for user: ${userId}`);
//       const error = new Error("Cart not found");
//       error.statusCode = 404;
//       throw error;
//     }

//     // Verify the restaurant exists in the cart
//     if (!cart.itemsByRestaurant.has(restaurantId)) {
//       logger.error(`[CART_SERVICE] {action:setActiveRestaurant, status:failed} Restaurant not in cart: ${restaurantId}`);
//       const error = new Error("Restaurant not found in cart");
//       error.statusCode = 404;
//       throw error;
//     }

//     cart.activeRestaurantId = restaurantId;
//     const updatedCart = await cart.save();

//     logger.info(`[CART_SERVICE] {action:setActiveRestaurant, status:success} Active restaurant set: ${restaurantId}`);

//     return updatedCart;
//   } catch (error) {
//     logger.error(`[CART_SERVICE] {action:setActiveRestaurant, status:error} ${error.message}`, { stack: error.stack });
//     throw error;
//   }
// };