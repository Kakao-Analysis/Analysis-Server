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

<<<<<<< HEAD
  try {
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
  } catch (error) {
    console.error("Error creating analysis session:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create analysis session",
    });
  }
=======
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
>>>>>>> parent of f5b8484 (feat: 분석 세션 생성 API 구현)
});

/**
 * GET /api/analysis/:sessionUuid
 * 세션 조회 -> DB 조회
 */
router.get("/analysis/:sessionUuid", async (req, res) => {
  const { sessionUuid } = req.params;

  try {
    const row = await prisma.analysis.findUnique({
      where: { sessionUuid },
    });

    if (!row) {
      return res.status(404).json({ error: "Not Found" });
    }

    // optionsJson에서 empathy, select1, select2 추출
    let empathy = null;
    let select1 = null;
    let select2 = null;
    if (row.optionsJson) {
      try {
        const options = JSON.parse(row.optionsJson);
        empathy = options.empathy || null;
        select1 = options.select1 || null;
        select2 = options.select2 || null;
      } catch (error) {
        console.error(
          `Error parsing optionsJson for sessionUuid: ${row.sessionUuid}, id: ${row.id}`,
          error
        );
        // empathy, select1, select2는 null 유지
      }
    }

    // resultJson에서 result 추출
    let result = null;
    if (row.resultJson) {
      try {
        result = JSON.parse(row.resultJson);
      } catch (error) {
        console.error(
          `Error parsing resultJson for sessionUuid: ${row.sessionUuid}, id: ${row.id}`,
          error
        );
        // result는 null 유지
      }
    }

    res.json({
      sessionUuid: row.sessionUuid,
      status: row.status,
      isPaid: false, // TODO: payment 테이블 연동 시 구현
      userName: row.userName,
      partnerName: row.partnerName,
      questionText: row.questionText,
      empathy,
      select1,
      select2,
      result,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching analysis session:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch analysis session",
    });
  }
});

module.exports = router;
