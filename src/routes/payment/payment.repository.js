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

async function markPaymentPaidAndUnlockAnalysis(paymentId, rawPayloadJson) {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error("NOT_FOUND");
    }

    const analysis = await tx.analysis.findUnique({
      where: { sessionUuid: payment.sessionUuid },
    });

    if (!analysis) {
      throw new Error("ANALYSIS_NOT_FOUND");
    }

    const now = new Date();

    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        paidAt: now,
        rawPayloadJson: rawPayloadJson ? JSON.stringify(rawPayloadJson) : null,
      },
    });

    await tx.analysis.update({
      where: { sessionUuid: payment.sessionUuid },
      data: {
        isPaid: true,
        unlockedAt: now,
      },
    });

    return updatedPayment;
  });
}

module.exports = {
  findAnalysisBySessionUuid,
  createPayment,
  updatePaymentPayUrl,
  findPaymentById,
  updatePaymentStatus,
  markPaymentPaidAndUnlockAnalysis,
};
