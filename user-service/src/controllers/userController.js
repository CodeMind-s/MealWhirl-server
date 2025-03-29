const User = require("../models/userModel");
const { sendKafkaMessage } = require("../services/kafkaService");

exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.createUser = async (req, res) => {
  const user = new User(req.body);
  await user.save();

  sendKafkaMessage("user-events", { event: "user_created", user });

  res.status(201).json(user);
};
