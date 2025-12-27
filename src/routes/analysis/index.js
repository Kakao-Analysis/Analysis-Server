const express = require("express");
const { upload } = require("../../middleware/upload");
const analysisController = require("./analysis.controller");

const router = express.Router();

router.post("/analysis", analysisController.createAnalysis);
router.get("/analysis/:sessionUuid", analysisController.getAnalysis);


router.patch("/analysis/:sessionUuid",analysisController.updateAnalysisBasic); //새로운 컨트롤러 추가했습니다.

router.patch("/analysis/:sessionUuid/options", analysisController.updateAnalysisOptions);
router.post(
  "/analysis/:sessionUuid/upload",
  upload.single("file"),
  analysisController.uploadAnalysisFile
);
router.post("/analysis/:sessionUuid/run", analysisController.runAnalysis);
router.get("/analysis/:sessionUuid/payment-status", analysisController.getPaymentStatus);


module.exports = router;