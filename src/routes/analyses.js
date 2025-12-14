const express = require("express");
const { prisma } = require("../db/prisma");
const { randomUUID } = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// uploads 디렉토리 생성 (없으면)
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const { sessionUuid } = req.params;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || ".txt";
    cb(null, `${sessionUuid}_${timestamp}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * OptionItem 검증 헬퍼 함수
 * @param {number} optionId - 검증할 OptionItem의 ID
 * @param {string} expectedCategory - 기대하는 category (SELECT1 또는 SELECT2)
 * @returns {Promise<{error: string | null, option: any}>} - 에러가 있으면 error, 없으면 option 반환
 */
async function validateOptionItem(optionId, expectedCategory) {
  const option = await prisma.optionItem.findUnique({
    where: { id: optionId },
  });

  if (!option) {
    return {
      error: `OptionItem with id ${optionId} not found`,
      option: null,
    };
  }

  if (!option.isActive) {
    return {
      error: `OptionItem with id ${optionId} is not active`,
      option: null,
    };
  }

  if (option.category !== expectedCategory) {
    return {
      error: `OptionItem with id ${optionId} has category ${option.category}, expected ${expectedCategory}`,
      option: null,
    };
  }

  return { error: null, option };
}

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

/**
 * PATCH /api/analysis/:sessionUuid/options
 * 분석 옵션 업데이트
 */
router.patch("/analysis/:sessionUuid/options", async (req, res) => {
  const { sessionUuid } = req.params;
  const { select1OptionId, select2OptionId } = req.body;

  try {
    // Validation: Body 필수값 검증
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

    // Analysis 조회
    const analysis = await prisma.analysis.findUnique({
      where: { sessionUuid },
    });

    if (!analysis) {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }

    // OptionItem 검증: select1OptionId
    const select1Validation = await validateOptionItem(
      select1OptionId,
      "SELECT1"
    );
    if (select1Validation.error) {
      return res.status(400).json({
        error: "Bad Request",
        message: select1Validation.error,
      });
    }
    const select1Option = select1Validation.option;

    // OptionItem 검증: select2OptionId
    const select2Validation = await validateOptionItem(
      select2OptionId,
      "SELECT2"
    );
    if (select2Validation.error) {
      return res.status(400).json({
        error: "Bad Request",
        message: select2Validation.error,
      });
    }
    const select2Option = select2Validation.option;

    // 기존 optionsJson 파싱 (있으면 merge)
    let optionsJson = {};
    if (analysis.optionsJson) {
      try {
        optionsJson = JSON.parse(analysis.optionsJson);
      } catch (error) {
        console.error(
          `Error parsing existing optionsJson for sessionUuid: ${sessionUuid}`,
          error
        );
        // 파싱 실패 시 빈 객체로 시작
        optionsJson = {};
      }
    }

    // select1, select2 업데이트 (empathy는 기존 값 유지)
    optionsJson.select1 = {
      id: select1Option.id,
      label: select1Option.label,
    };
    optionsJson.select2 = {
      id: select2Option.id,
      label: select2Option.label,
    };

    // Analysis 업데이트
    const updatedAnalysis = await prisma.analysis.update({
      where: { sessionUuid },
      data: {
        optionsJson: JSON.stringify(optionsJson),
      },
    });

    res.status(200).json({
      sessionUuid: updatedAnalysis.sessionUuid,
      status: updatedAnalysis.status,
    });
  } catch (error) {
    console.error("Error updating analysis options:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update analysis options",
    });
  }
});

/**
 * POST /api/analysis/:sessionUuid/upload
 * 파일 업로드
 */
router.post(
  "/analysis/:sessionUuid/upload",
  upload.single("file"),
  async (req, res) => {
    const { sessionUuid } = req.params;

    try {
      // Validation: file 누락 검증
      if (!req.file) {
        return res.status(400).json({
          error: "Bad Request",
          message: "file is required",
        });
      }

      // Validation: 파일 확장자 검증 (.txt만 허용)
      const fileExt = path.extname(req.file.originalname).toLowerCase();

      if (fileExt !== ".txt") {
        // 업로드된 파일 삭제
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          error: "Bad Request",
          message: "Only .txt files are allowed",
        });
      }

      // Analysis 조회
      const analysis = await prisma.analysis.findUnique({
        where: { sessionUuid },
      });

      if (!analysis) {
        // 업로드된 파일 삭제
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ ok: false, error: "NOT_FOUND" });
      }

      // AnalysisFile 생성과 Analysis.status 업데이트를 트랜잭션으로 처리
      const [fileRecord, updatedAnalysis] = await prisma.$transaction([
        prisma.analysisFile.create({
          data: {
            sessionUuid: sessionUuid,
            originalName: req.file.originalname,
            storedPath: req.file.path,
            size: req.file.size,
            mimeType: req.file.mimetype || "text/plain",
          },
        }),
        prisma.analysis.update({
          where: { sessionUuid },
          data: {
            status: "FILE_UPLOADED",
          },
        }),
      ]);

      res.status(200).json({
        sessionUuid: updatedAnalysis.sessionUuid,
        fileId: fileRecord.id,
        status: updatedAnalysis.status,
      });
    } catch (error) {
      // 에러 발생 시 업로드된 파일 삭제
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error("Error uploading file:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to upload file",
      });
    }
  }
);

module.exports = router;
