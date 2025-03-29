const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: String,
  product: String,
});

module.exports = mongoose.model("Order", orderSchema);
