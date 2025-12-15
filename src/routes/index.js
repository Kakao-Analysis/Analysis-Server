const express = require("express");
const analysisRouter = require("./analysis");
const optionRouter = require("./option");
const paymentRouter = require("./payment");

const router = express.Router();

router.use(analysisRouter);
router.use(optionRouter);
router.use(paymentRouter);

module.exports = router;
