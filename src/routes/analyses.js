const express = require("express");
const { prisma } = require("../db/prisma");
const { randomUUID } = require("crypto");

const router = express.Router();

/**
 * POST /api/analysis
 * 세션 생성 -> DB 저장
 */
router.post("/analysis", async (req, res) => {
  const sessionUuid = randomUUID();

  const row = await prisma.analysis.create({
    data: {
      sessionUuid,
      status: "DRAFT",
    },
  });

  res.status(201).json({
    ok: true,
    data: {
      sessionUuid: row.sessionUuid,
      status: row.status,
      createdAt: row.createdAt,
    },
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
