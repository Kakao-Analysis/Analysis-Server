const paymentService = require("./payment.service");

async function startPayment(req, res) {
  const { sessionUuid, amount, provider } = req.body;

  try {
    const data = await paymentService.startPayment(sessionUuid, amount, provider);
    res.status(200).json(data);
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }
    console.error("Error starting payment:", error);
    res.status(400).json({
      error: "Bad Request",
      message: error.message,
    });
  }
}

async function processPaymentWebhook(req, res) {
  try {
    const { paymentId, status } = req.body;

    if (paymentId === undefined || paymentId === null) {
      return res.status(400).json({
        error: "Bad Request",
        message: "paymentId is required",
      });
    }

    const data = await paymentService.processPaymentWebhook(paymentId, status, req.body);
    res.status(200).json(data);
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        error: "NOT_FOUND",
      });
    }
    console.error("Error processing payment webhook:", error);
    res.status(500).json({
      ok: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

module.exports = {
  startPayment,
  processPaymentWebhook,
};
