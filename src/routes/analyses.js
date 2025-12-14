const express = require("express");
const { prisma } = require("../db/prisma");
const { randomUUID } = require("crypto");

const router = express.Router();

/**
 * POST /api/analysis
 * 세션 생성 -> DB 저장
 */
router.post("/analysis", async (req, res) => {
  const { userName, partnerName, questionText } = req.body;

  // Validation: 3개 필드 모두 필수
  if (!userName || !partnerName || !questionText) {
    return res.status(400).json({
      error: "Bad Request",
      message: "userName, partnerName, questionText are required",
    });
  }

  const sessionUuid = randomUUID();
  const empathyPreviewText = "지금 대화를 차분히 살펴보고 있어요.";

  const row = await prisma.analysis.create({
    data: {
      sessionUuid,
      status: "CREATED",
      userName,
      partnerName,
      questionText,
      empathyPreviewText,
    },
  });

  res.status(201).json({
    sessionId: row.id,
    sessionUuid: row.sessionUuid,
    status: row.status,
    empathyPreviewText: row.empathyPreviewText,
  });
});

/**
 * GET /api/analysis/:sessionUuid
 * 세션 조회 -> DB 조회
 */
router.get("/analysis/:sessionUuid", async (req, res) => {
  const { sessionUuid } = req.params;

  const row = await prisma.analysis.findUnique({
    where: { sessionUuid },
  });

  if (!row) {
    return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  }

  res.json({
    ok: true,
    data: {
      sessionUuid: row.sessionUuid,
      status: row.status,
      optionsJson: row.optionsJson ? JSON.parse(row.optionsJson) : null,
      resultJson: row.resultJson ? JSON.parse(row.resultJson) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
  });
});

module.exports = router;
