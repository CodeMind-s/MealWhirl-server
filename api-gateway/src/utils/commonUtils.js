const express = require("express");
const { BASE_URL } = require("../constants/configConstants");

const base64Util = {
  encode: (text) => {
    return Buffer.from(text, "utf-8").toString("base64");
  },

  decode: (base64Text) => {
    return Buffer.from(base64Text, "base64").toString("utf-8");
  },
};

const jsonParse = (req, res, next) => {
  if (
    req.originalUrl.startsWith(`${BASE_URL}/users/v1`) ||
    req.originalUrl.startsWith(`${BASE_URL}/auth/v1`)
  ) {
    return next();
  }
  express.json({ limit: "10mb" })(req, res, next);
};

module.exports = {
  jsonParse,
  base64Util,
};
