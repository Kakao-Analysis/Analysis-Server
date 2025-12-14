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

/**
 * GET /api/options
 * 옵션 아이템 조회
 */
router.get("/options", async (req, res) => {
  let { category } = req.query;

  // Validation: category는 필수
  if (!category) {
    return res.status(400).json({
      error: "Bad Request",
      message: "category query parameter is required",
    });
  }

  // Validation: category가 배열이면 400
  if (Array.isArray(category)) {
    return res.status(400).json({
      error: "Bad Request",
      message: "category must be a single value, not an array",
    });
  }

  // Validation: category가 string이 아니면 400
  if (typeof category !== "string") {
    return res.status(400).json({
      error: "Bad Request",
      message: "category must be a string",
    });
  }

  // 정규화: trim 후 빈 문자열이면 400
  category = category.trim();
  if (category === "") {
    return res.status(400).json({
      error: "Bad Request",
      message: "category cannot be empty",
    });
  }

  // 정규화: 대문자로 변환
  category = category.toUpperCase();

  // Validation: category 값은 EMPATHY | SELECT1 | SELECT2 만 허용
  const validCategories = ["EMPATHY", "SELECT1", "SELECT2"];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      error: "Bad Request",
      message: `category must be one of: ${validCategories.join(", ")}`,
    });
  }

  try {
    const items = await prisma.optionItem.findMany({
      where: {
        category: category,
      },
      orderBy: [
        { sortOrder: "asc" },
        { id: "asc" },
      ],
      select: {
        id: true,
        category: true,
        code: true,
        label: true,
        description: true,
        sortOrder: true,
        isActive: true,
      },
    });

    res.json(items);
  } catch (error) {
    console.error("Error fetching option items:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch option items",
    });
  }
});

module.exports = router;
