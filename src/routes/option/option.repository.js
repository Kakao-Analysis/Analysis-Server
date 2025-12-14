const { prisma } = require("../../db/prisma");

async function findOptionItemById(id) {
  return await prisma.optionItem.findUnique({
    where: { id },
  });
}

async function findOptionItemsByCategory(category) {
  return await prisma.optionItem.findMany({
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
}

module.exports = {
  findOptionItemById,
  findOptionItemsByCategory,
};
