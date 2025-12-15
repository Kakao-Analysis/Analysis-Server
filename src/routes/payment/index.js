const express = require("express");
const paymentController = require("./payment.controller");
const { webhookAuth } = require("../../middleware/webhookAuth");

const router = express.Router();

router.post("/payments/start", paymentController.startPayment);
router.post("/payments/webhook", webhookAuth, paymentController.processPaymentWebhook);

module.exports = router;
