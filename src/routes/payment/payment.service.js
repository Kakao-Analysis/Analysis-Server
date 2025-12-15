const paymentRepository = require("./payment.repository");

function validateAmount(amount) {
  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("amount must be a positive number");
  }
}

function validateProvider(provider) {
  const validProviders = ["toss", "kakaopay"];
  if (!validProviders.includes(provider)) {
    throw new Error(`provider must be one of: ${validProviders.join(", ")}`);
  }
}

function validatePaymentStatus(status) {
  if (status !== "SUCCESS" && status !== "FAILED") {
    throw new Error(`status must be SUCCESS or FAILED, got: ${status}`);
  }
}

async function startPayment(sessionUuid, amount, provider) {
  const analysis = await paymentRepository.findAnalysisBySessionUuid(sessionUuid);
  if (!analysis) {
    throw new Error("NOT_FOUND");
  }

  validateAmount(amount);
  validateProvider(provider);

  const payment = await paymentRepository.createPayment(sessionUuid, amount, provider);
  const baseUrl = process.env.PAYMENTS_BASE_URL || "http://localhost:3000";
  const payUrl = `${baseUrl}/payments/mock/${payment.id}`;
  const updatedPayment = await paymentRepository.updatePaymentPayUrl(
    payment.id,
    payUrl
  );

  return {
    paymentId: updatedPayment.id,
    sessionUuid: updatedPayment.sessionUuid,
    payUrl: updatedPayment.payUrl,
    status: updatedPayment.status,
  };
}

async function processPaymentWebhook(paymentId, status, rawPayload) {
  if (paymentId === undefined || paymentId === null) {
    throw new Error("paymentId is required");
  }

  const payment = await paymentRepository.findPaymentById(paymentId);
  if (!payment) {
    throw new Error(`Payment with id ${paymentId} not found`);
  }

  validatePaymentStatus(status);

  const paidAt = status === "SUCCESS" ? new Date() : null;
  await paymentRepository.updatePaymentStatus(paymentId, status, paidAt, rawPayload);

  return { ok: true };
}

module.exports = {
  startPayment,
  processPaymentWebhook,
};
