const Order = require("../models/orderModel");
const { sendKafkaMessage } = require("../services/kafkaService");

const getOrders = async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
};

const createOrder = async (req, res) => {
  console.log("Creating order:", req.body);
  const order = new Order(req.body);
  await order.save();

  sendKafkaMessage("order-events", { event: "order_created", order });

  res.status(201).json(order);
};

module.exports = { getOrders, createOrder };