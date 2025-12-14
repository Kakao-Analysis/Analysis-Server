const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Seed the OptionItem table by removing existing records and inserting predefined items for EMPATHY, SELECT1, and SELECT2 categories.
 */
async function main() {
  // Production 환경 가드
  if (process.env.NODE_ENV === "production") {
    const forceReset = process.env.FORCE_RESET_SEED === "true" || process.env.FORCE_SEED === "true";
    if (!forceReset) {
      throw new Error(
        "Seed script is not allowed in production without FORCE_RESET_SEED=true or FORCE_SEED=true"
      );
    }
  }

  // FORCE_RESET_SEED가 true일 때만 기존 데이터 삭제
  if (process.env.FORCE_RESET_SEED === "true") {
    try {
      await prisma.optionItem.deleteMany({});
      console.log("Existing option items deleted (FORCE_RESET_SEED=true)");
    } catch (error) {
      console.error("Error deleting existing option items:", error);
      throw error;
    }
  }

  // EMPATHY 카테고리 옵션 (멱등성 보장: upsert 사용)
  try {
    await Promise.all([
      prisma.optionItem.upsert({
        where: { category_code: { category: "EMPATHY", code: "EMPATHY_1" } },
        update: {},
        create: {
          category: "EMPATHY",
          code: "EMPATHY_1",
          label: "공감형",
          description: "상대방의 감정을 이해하고 공감하는 스타일",
          sortOrder: 1,
          isActive: true,
        },
      }),
      prisma.optionItem.upsert({
        where: { category_code: { category: "EMPATHY", code: "EMPATHY_2" } },
        update: {},
        create: {
          category: "EMPATHY",
          code: "EMPATHY_2",
          label: "분석형",
          description: "상황을 객관적으로 분석하는 스타일",
          sortOrder: 2,
          isActive: true,
        },
      }),
      prisma.optionItem.upsert({
        where: { category_code: { category: "EMPATHY", code: "EMPATHY_3" } },
        update: {},
        create: {
          category: "EMPATHY",
          code: "EMPATHY_3",
          label: "직설형",
          description: "솔직하고 직접적인 의사소통 스타일",
          sortOrder: 3,
          isActive: true,
        },
      }),
    ]);
    console.log("EMPATHY category options seeded");
  } catch (error) {
    console.error("Error seeding EMPATHY category options:", error);
    throw error;
  }

  // SELECT1 카테고리 옵션 (멱등성 보장: upsert 사용)
  try {
    await Promise.all([
      prisma.optionItem.upsert({
        where: { category_code: { category: "SELECT1", code: "SELECT1_1" } },
        update: {},
        create: {
          category: "SELECT1",
          code: "SELECT1_1",
          label: "옵션 A",
          description: "첫 번째 선택 옵션",
          sortOrder: 1,
          isActive: true,
        },
      }),
      prisma.optionItem.upsert({
        where: { category_code: { category: "SELECT1", code: "SELECT1_2" } },
        update: {},
        create: {
          category: "SELECT1",
          code: "SELECT1_2",
          label: "옵션 B",
          description: "두 번째 선택 옵션",
          sortOrder: 2,
          isActive: true,
        },
      }),
    ]);
    console.log("SELECT1 category options seeded");
  } catch (error) {
    console.error("Error seeding SELECT1 category options:", error);
    throw error;
  }

  // SELECT2 카테고리 옵션 (멱등성 보장: upsert 사용)
  try {
    await Promise.all([
      prisma.optionItem.upsert({
        where: { category_code: { category: "SELECT2", code: "SELECT2_1" } },
        update: {},
        create: {
          category: "SELECT2",
          code: "SELECT2_1",
          label: "선택지 1",
          description: "첫 번째 선택지",
          sortOrder: 1,
          isActive: true,
        },
      }),
      prisma.optionItem.upsert({
        where: { category_code: { category: "SELECT2", code: "SELECT2_2" } },
        update: {},
        create: {
          category: "SELECT2",
          code: "SELECT2_2",
          label: "선택지 2",
          description: "두 번째 선택지",
          sortOrder: 2,
          isActive: true,
        },
      }),
      prisma.optionItem.upsert({
        where: { category_code: { category: "SELECT2", code: "SELECT2_3" } },
        update: {},
        create: {
          category: "SELECT2",
          code: "SELECT2_3",
          label: "선택지 3",
          description: "세 번째 선택지",
          sortOrder: 3,
          isActive: true,
        },
      }),
    ]);
    console.log("SELECT2 category options seeded");
  } catch (error) {
    console.error("Error seeding SELECT2 category options:", error);
    throw error;
  }

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error("Seed script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
