const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://user-service:5001/users");
    res.json(response.data);
  } catch (error) {
    res.status(500).send("Error contacting user service");
  }
});

router.post("/", async (req, res) => {
  try {
    const response = await axios.post("http://user-service:5001/users", req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).send("Error contacting user service");
  }
});

module.exports = router;
