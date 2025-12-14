const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Seed the OptionItem table by removing existing records and inserting predefined items for EMPATHY, SELECT1, and SELECT2 categories.
 */
async function main() {
  // 기존 데이터 삭제 (재실행 시)
  await prisma.optionItem.deleteMany({});

  // EMPATHY 카테고리 옵션
  await prisma.optionItem.createMany({
    data: [
      {
        category: "EMPATHY",
        code: "EMPATHY_1",
        label: "공감형",
        description: "상대방의 감정을 이해하고 공감하는 스타일",
        sortOrder: 1,
        isActive: true,
      },
      {
        category: "EMPATHY",
        code: "EMPATHY_2",
        label: "분석형",
        description: "상황을 객관적으로 분석하는 스타일",
        sortOrder: 2,
        isActive: true,
      },
      {
        category: "EMPATHY",
        code: "EMPATHY_3",
        label: "직설형",
        description: "솔직하고 직접적인 의사소통 스타일",
        sortOrder: 3,
        isActive: true,
      },
    ],
  });

  // SELECT1 카테고리 옵션
  await prisma.optionItem.createMany({
    data: [
      {
        category: "SELECT1",
        code: "SELECT1_1",
        label: "옵션 A",
        description: "첫 번째 선택 옵션",
        sortOrder: 1,
        isActive: true,
      },
      {
        category: "SELECT1",
        code: "SELECT1_2",
        label: "옵션 B",
        description: "두 번째 선택 옵션",
        sortOrder: 2,
        isActive: true,
      },
    ],
  });

  // SELECT2 카테고리 옵션
  await prisma.optionItem.createMany({
    data: [
      {
        category: "SELECT2",
        code: "SELECT2_1",
        label: "선택지 1",
        description: "첫 번째 선택지",
        sortOrder: 1,
        isActive: true,
      },
      {
        category: "SELECT2",
        code: "SELECT2_2",
        label: "선택지 2",
        description: "두 번째 선택지",
        sortOrder: 2,
        isActive: true,
      },
      {
        category: "SELECT2",
        code: "SELECT2_3",
        label: "선택지 3",
        description: "세 번째 선택지",
        sortOrder: 3,
        isActive: true,
      },
    ],
  });

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
