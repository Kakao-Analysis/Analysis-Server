const fs = require("fs");
const analysisService = require("./analysis.service");

async function createAnalysis(req, res) {
  const { userName, partnerName, questionText } = req.body;

  //  1단계에서는 userName만 필수
  if (!userName || typeof userName !== "string" || userName.trim() === "") {
    return res.status(400).json({
      error: "Bad Request",
      message: "userName is required and must be a non-empty string",
    });
  }

  //  변경됨: partnerName 검증 제거 (나중 단계에서 받음)
  //  변경됨: questionText 검증 제거 (나중 단계에서 받음)

  try {
    const data = await analysisService.createAnalysis(
      userName,
      partnerName || "",      //  변경됨: 없으면 빈 문자열
      questionText || ""      //  변경됨: 없으면 빈 문자열
    );

    res.status(201).json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Error creating analysis:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create analysis",
    });
  }
}

async function getAnalysis(req, res) {
  const { sessionUuid } = req.params;

  try {
    const data = await analysisService.getAnalysis(sessionUuid);
    if (!data) {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }
    res.json(data);
  } catch (error) {
    console.error("Error fetching analysis:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch analysis",
    });
  }
}

async function updateAnalysisOptions(req, res) {
  const { sessionUuid } = req.params;
  const { select1OptionId, select2OptionId } = req.body;

  try {
    if (
      select1OptionId === undefined ||
      select2OptionId === undefined ||
      typeof select1OptionId !== "number" ||
      typeof select2OptionId !== "number"
    ) {
      return res.status(400).json({
        error: "Bad Request",
        message: "select1OptionId and select2OptionId are required and must be numbers",
      });
    }

    const data = await analysisService.updateAnalysisOptions(
      sessionUuid,
      select1OptionId,
      select2OptionId
    );
    res.status(200).json(data);
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }
    console.error("Error updating analysis options:", error);
    res.status(400).json({
      error: "Bad Request",
      message: error.message,
    });
  }
}

async function uploadAnalysisFile(req, res) {
  const { sessionUuid } = req.params;

  try {
    const data = await analysisService.uploadAnalysisFile(sessionUuid, req.file);
    res.status(200).json(data);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }
    console.error("Error uploading file:", error);
    res.status(400).json({
      error: "Bad Request",
      message: error.message,
    });
  }
}

async function runAnalysis(req, res) {
  const { sessionUuid } = req.params;
  const { agreeTerms, agreePrivacy } = req.body;

  if (typeof agreeTerms !== "boolean" || typeof agreePrivacy !== "boolean") {
    return res.status(400).json({
      error: "Bad Request",
      message: "agreeTerms and agreePrivacy must be boolean values",
    });
  }

  if (agreeTerms !== true || agreePrivacy !== true) {
    return res.status(400).json({
      error: "Bad Request",
      message: "agreeTerms and agreePrivacy must be true",
    });
  }

  try {
    const data = await analysisService.runAnalysis(sessionUuid, agreeTerms, agreePrivacy);
    res.status(200).json(data);
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }
    console.error("Error running analysis:", error);
    res.status(400).json({
      error: "Bad Request",
      message: error.message,
    });
  }
}

async function getPaymentStatus(req, res) {
  const { sessionUuid } = req.params;

  try {
    const data = await analysisService.getPaymentStatus(sessionUuid);
    res.status(200).json(data);
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }
    console.error("Error fetching payment status:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch payment status",
    });
  }
}

//추가했습니다.
async function updateAnalysisBasic(req, res) {
  const { sessionUuid } = req.params;
  const { partnerName, questionText } = req.body;

  if (
    (partnerName !== undefined && typeof partnerName !== "string") ||
    (questionText !== undefined && typeof questionText !== "string")
  ) {
    return res.status(400).json({
      error: "Bad Request",
      message: "partnerName / questionText must be string",
    });
  }

  try {
    const data = await analysisService.updateAnalysisBasic(
      sessionUuid,
      { partnerName, questionText }
    );
    res.status(200).json(data);
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }

    console.error("Error updating analysis basic:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update analysis",
    });
  }
}

module.exports = {
  createAnalysis,
  getAnalysis,
  updateAnalysisBasic, // 추가했습니다.
  updateAnalysisOptions,
  uploadAnalysisFile,
  runAnalysis,
  getPaymentStatus,
};
