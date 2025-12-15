const fs = require("fs");
const analysisService = require("./analysis.service");

async function createAnalysis(req, res) {
  const { userName, partnerName, questionText } = req.body;

  if (!userName || typeof userName !== "string" || userName.trim() === "") {
    return res.status(400).json({
      error: "Bad Request",
      message: "userName is required and must be a non-empty string",
    });
  }

  if (!partnerName || typeof partnerName !== "string" || partnerName.trim() === "") {
    return res.status(400).json({
      error: "Bad Request",
      message: "partnerName is required and must be a non-empty string",
    });
  }

  if (!questionText || typeof questionText !== "string" || questionText.trim() === "") {
    return res.status(400).json({
      error: "Bad Request",
      message: "questionText is required and must be a non-empty string",
    });
  }

  try {
    const data = await analysisService.createAnalysis(userName, partnerName, questionText);
    res.status(201).json(data);
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

module.exports = {
  createAnalysis,
  getAnalysis,
  updateAnalysisOptions,
  uploadAnalysisFile,
  runAnalysis,
  getPaymentStatus,
};
