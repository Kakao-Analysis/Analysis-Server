const express = require("express");
const optionController = require("./option.controller");

const router = express.Router();

router.get("/options", optionController.getOptionItems);

module.exports = { router };
