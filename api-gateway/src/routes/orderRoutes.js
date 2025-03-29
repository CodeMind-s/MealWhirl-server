const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://order-service:5002/orders");
    res.json(response.data);
  } catch (error) {
    res.status(500).send("Error contacting order service");
  }
});

router.post("/", async (req, res) => {
  try {
    const response = await axios.post("http://order-service:5002/orders", req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).send("Error contacting order service");
  }
});

module.exports = router;
