const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const analysisRepository = require("./analysis.repository");
const { validateOptionItem } = require("../option/option.service");

async function createAnalysis(userName, partnerName, questionText) {
  const sessionUuid = randomUUID();
  const analysis = await analysisRepository.createAnalysis(
    sessionUuid,
    userName,
    partnerName,
    questionText
  );
  
  const empathyPreviewText = `안녕하세요 ${userName}님, ${partnerName}님과의 관계를 분석해드리겠습니다.`;
  
  return {
    sessionId: analysis.id,
    sessionUuid: analysis.sessionUuid,
    status: analysis.status,
    empathyPreviewText,
  };
}

async function getAnalysis(sessionUuid) {
  const analysis = await analysisRepository.findAnalysisBySessionUuid(sessionUuid);
  if (!analysis) {
    return null;
  }

  const latestPayment = await analysisRepository.findLatestPaymentBySessionUuid(sessionUuid);
  const isPaid = latestPayment?.status === "SUCCESS" || false;

  let optionsJson = {};
  if (analysis.optionsJson) {
    try {
      optionsJson = JSON.parse(analysis.optionsJson);
    } catch (error) {
      console.error(
        `Error parsing optionsJson for sessionUuid: ${sessionUuid}`,
        error
      );
      optionsJson = {};
    }
  }

  let resultJson = null;
  if (analysis.resultJson) {
    try {
      resultJson = JSON.parse(analysis.resultJson);
    } catch (error) {
      console.error(
        `Error parsing resultJson for sessionUuid: ${sessionUuid}`,
        error
      );
      resultJson = null;
    }
  }

  return {
    sessionUuid: analysis.sessionUuid,
    status: analysis.status,
    isPaid,
    userName: analysis.userName,
    partnerName: analysis.partnerName,
    questionText: analysis.questionText,
    empathy: optionsJson.empathy || null,
    select1: optionsJson.select1 || null,
    select2: optionsJson.select2 || null,
    result: resultJson,
    createdAt: analysis.createdAt.toISOString(),
    updatedAt: analysis.updatedAt.toISOString(),
  };
}

async function updateAnalysisOptions(sessionUuid, select1OptionId, select2OptionId) {
  const analysis = await analysisRepository.findAnalysisBySessionUuid(sessionUuid);
  if (!analysis) {
    throw new Error("NOT_FOUND");
  }

  const select1Validation = await validateOptionItem(select1OptionId, "SELECT1");
  if (select1Validation.error) {
    throw new Error(select1Validation.error);
  }
  const select1Option = select1Validation.option;

  const select2Validation = await validateOptionItem(select2OptionId, "SELECT2");
  if (select2Validation.error) {
    throw new Error(select2Validation.error);
  }
  const select2Option = select2Validation.option;

  let optionsJson = {};
  if (analysis.optionsJson) {
    try {
      optionsJson = JSON.parse(analysis.optionsJson);
    } catch (error) {
      console.error(
        `Error parsing existing optionsJson for sessionUuid: ${sessionUuid}`,
        error
      );
      optionsJson = {};
    }
  }

  optionsJson.select1 = {
    id: select1Option.id,
    label: select1Option.label,
  };
  optionsJson.select2 = {
    id: select2Option.id,
    label: select2Option.label,
  };

  const updatedAnalysis = await analysisRepository.updateAnalysisOptions(
    sessionUuid,
    optionsJson
  );

  return {
    sessionUuid: updatedAnalysis.sessionUuid,
    status: updatedAnalysis.status,
  };
}

async function uploadAnalysisFile(sessionUuid, file) {
  if (!file) {
    throw new Error("file is required");
  }

  const fileExt = path.extname(file.originalname).toLowerCase();
  if (fileExt !== ".txt") {
    if (fs.existsSync(file.path)) {
      await fs.promises.unlink(file.path).catch(() => {});
    }
    throw new Error("Only .txt files are allowed");
  }

  const analysis = await analysisRepository.findAnalysisBySessionUuid(sessionUuid);
  if (!analysis) {
    if (fs.existsSync(file.path)) {
      await fs.promises.unlink(file.path).catch(() => {});
    }
    throw new Error("NOT_FOUND");
  }

  try {
    const [fileRecord, updatedAnalysis] = await analysisRepository.createAnalysisFileAndUpdateStatus(
      sessionUuid,
      {
        originalName: file.originalname,
        storedPath: file.path,
        size: file.size,
        mimeType: file.mimetype,
      }
    );

    return {
      sessionUuid: updatedAnalysis.sessionUuid,
      fileId: fileRecord.id,
      status: updatedAnalysis.status,
    };
  } catch (error) {
    if (fs.existsSync(file.path)) {
      await fs.promises.unlink(file.path).catch(() => {});
    }
    throw error;
  }
}

async function runAnalysis(sessionUuid, agreeTerms, agreePrivacy) {
  if (agreeTerms !== true || agreePrivacy !== true) {
    throw new Error("agreeTerms and agreePrivacy must be true");
  }

  const analysis = await analysisRepository.findAnalysisBySessionUuid(sessionUuid);
  if (!analysis) {
    throw new Error("NOT_FOUND");
  }

  const latestFile = await analysisRepository.findLatestAnalysisFileBySessionUuid(sessionUuid);
  if (!latestFile) {
    throw new Error("file is required");
  }

  try {
    await analysisRepository.updateAnalysisStatus(sessionUuid, "PROCESSING");

    const fileContent = await fs.promises.readFile(latestFile.storedPath, "utf-8");
    const lines = fileContent.split("\n").filter((line) => line.trim() !== "");
    const lineCount = lines.length;
    const messageCount = lineCount;

    let participants = ["나", "상대"];
    const participantSet = new Set();
    for (const line of lines) {
      const match = line.match(/,\s*([^:]+):\s*(.+)/);
      if (match) {
        participantSet.add(match[1].trim());
      }
    }

    if (participantSet.size > 0) {
      participants = Array.from(participantSet);
    }

    const resultObject = {
      summaryText: `총 ${lineCount}줄의 대화를 분석했습니다.`,
      userViewText: null,
      partnerViewText: null,
      adviceText: null,
      scores: {
        positivity: 50,
        interest: 50,
        balance: 50,
      },
      charts: {},
      details: {
        lineCount,
        messageCount,
        participants,
      },
    };

    await analysisRepository.updateAnalysisResult(sessionUuid, resultObject, "DONE");

    return {
      sessionUuid,
      status: "DONE",
    };
  } catch (error) {
    console.error("Error in analysis processing:", error);
    try {
      await analysisRepository.updateAnalysisStatus(sessionUuid, "FAILED");
    } catch (updateError) {
      console.error("Error updating status to FAILED:", updateError);
    }
    return {
      sessionUuid,
      status: "FAILED",
    };
  }
}

async function getPaymentStatus(sessionUuid) {
  const analysis = await analysisRepository.findAnalysisBySessionUuid(sessionUuid);
  if (!analysis) {
    throw new Error("NOT_FOUND");
  }

  const latestPayment = await analysisRepository.findLatestPaymentBySessionUuid(sessionUuid);

  if (!latestPayment) {
    return {
      sessionUuid,
      isPaid: false,
      lastPaymentStatus: "PENDING",
      lastPaidAt: null,
    };
  }

  return {
    sessionUuid,
    isPaid: latestPayment.status === "SUCCESS",
    lastPaymentStatus: latestPayment.status,
    lastPaidAt: latestPayment.paidAt ? latestPayment.paidAt.toISOString() : null,
  };
}

module.exports = {
  createAnalysis,
  getAnalysis,
  updateAnalysisOptions,
  uploadAnalysisFile,
  runAnalysis,
  getPaymentStatus,
};
