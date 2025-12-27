const { prisma } = require("../../db/prisma");

async function createAnalysis(sessionUuid, userName, partnerName, questionText) {
  return await prisma.analysis.create({
    data: {
      sessionUuid,
      status: "CREATED",
      userName,
      partnerName,
      questionText,
      optionsJson: JSON.stringify({}),
    },
  });
}

async function findAnalysisBySessionUuid(sessionUuid) {
  return await prisma.analysis.findUnique({
    where: { sessionUuid },
  });
}

async function updateAnalysisOptions(sessionUuid, optionsJson) {
  return await prisma.analysis.update({
    where: { sessionUuid },
    data: {
      optionsJson: JSON.stringify(optionsJson),
    },
  });
}

async function updateAnalysisStatus(sessionUuid, status) {
  return await prisma.analysis.update({
    where: { sessionUuid },
    data: {
      status,
    },
  });
}

async function updateAnalysisResult(sessionUuid, resultJson, status) {
  return await prisma.analysis.update({
    where: { sessionUuid },
    data: {
      resultJson: JSON.stringify(resultJson),
      status,
    },
  });
}

async function findLatestPaymentBySessionUuid(sessionUuid) {
  return await prisma.payment.findFirst({
    where: { sessionUuid },
    orderBy: { createdAt: "desc" },
  });
}

async function findLatestAnalysisFileBySessionUuid(sessionUuid) {
  return await prisma.analysisFile.findFirst({
    where: { sessionUuid },
    orderBy: { createdAt: "desc" },
  });
}

async function createAnalysisFileAndUpdateStatus(sessionUuid, fileData) {
  return await prisma.$transaction([
    prisma.analysisFile.create({
      data: {
        sessionUuid: sessionUuid,
        originalName: fileData.originalName,
        storedPath: fileData.storedPath,
        size: fileData.size,
        mimeType: fileData.mimeType || "text/plain",
      },
    }),
    prisma.analysis.update({
      where: { sessionUuid },
      data: {
        status: "FILE_UPLOADED",
      },
    }),
  ]);
}

// 추가 달라짐
async function updateAnalysisBasic(sessionUuid, data) {
  return await prisma.analysis.update({
    where: { sessionUuid },
    data,
  });
}

module.exports = {
  createAnalysis,
  findAnalysisBySessionUuid,
  updateAnalysisOptions,
  updateAnalysisStatus,
  updateAnalysisResult,
  updateAnalysisBasic, //추가됨
  findLatestPaymentBySessionUuid,
  findLatestAnalysisFileBySessionUuid,
  createAnalysisFileAndUpdateStatus,
};


