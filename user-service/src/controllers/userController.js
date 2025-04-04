const User = require('../models/userModel');

exports.createUser = async (userData) => {
  try {
    const { name, email, address } = userData;
    
    if (!name || !email) {
      const error = new Error('Name and email are required');
      error.statusCode = 400;
      throw error;
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      throw error;
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      address
    });
    
    const savedUser = await user.save();
    
    return savedUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

exports.getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    return { user };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};