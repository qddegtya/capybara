const axios = require("axios");
const path = require("path");

exports.BASE = "https://oapi.dingtalk.com/";
exports.APP_KEY = "";
exports.APP_SECRET =
  "";

exports.HTTP_CLIENT = axios.create({
  baseURL: exports.BASE,
  timeout: 60000,
});

exports.CACHE_KEYS = {
  ACCESS_TOKEN: "access-token",
};

exports.CACHE = {
  ROOT: path.resolve(path.join(__dirname, "../", ".tmp")),
};

exports.ACCESS_TOKEN_EXPIRE_IN = 7200;
