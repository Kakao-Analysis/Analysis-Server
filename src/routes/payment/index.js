const express = require("express");
const paymentController = require("./payment.controller");

const router = express.Router();

router.post("/payments/start", paymentController.startPayment);
router.post("/payments/webhook", paymentController.processPaymentWebhook);

module.exports = router;
