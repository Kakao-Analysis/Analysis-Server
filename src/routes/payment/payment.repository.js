const { prisma } = require("../../db/prisma");

async function findAnalysisBySessionUuid(sessionUuid) {
  return await prisma.analysis.findUnique({
    where: { sessionUuid },
  });
}

async function createPayment(sessionUuid, amount, provider) {
  return await prisma.payment.create({
    data: {
      sessionUuid,
      amount,
      provider,
      status: "PENDING",
    },
  });
}

async function updatePaymentPayUrl(id, payUrl) {
  return await prisma.payment.update({
    where: { id },
    data: {
      payUrl,
    },
  });
}

async function findPaymentById(id) {
  return await prisma.payment.findUnique({
    where: { id },
  });
}

async function updatePaymentStatus(id, status, paidAt, rawPayloadJson) {
  return await prisma.payment.update({
    where: { id },
    data: {
      status,
      paidAt,
      rawPayloadJson: rawPayloadJson ? JSON.stringify(rawPayloadJson) : null,
    },
  });
}

module.exports = {
  findAnalysisBySessionUuid,
  createPayment,
  updatePaymentPayUrl,
  findPaymentById,
  updatePaymentStatus,
};
