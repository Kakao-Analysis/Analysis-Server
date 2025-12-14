const optionRepository = require("./option.repository");

async function validateOptionItem(optionId, expectedCategory) {
  const option = await optionRepository.findOptionItemById(optionId);

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

function validateCategory(category) {
  if (!category) {
    throw new Error("category query parameter is required");
  }

  if (Array.isArray(category)) {
    throw new Error("category must be a single value, not an array");
  }

  if (typeof category !== "string") {
    throw new Error("category must be a string");
  }

  category = category.trim();
  if (category === "") {
    throw new Error("category cannot be empty");
  }

  category = category.toUpperCase();

  const validCategories = ["EMPATHY", "SELECT1", "SELECT2"];
  if (!validCategories.includes(category)) {
    throw new Error(`category must be one of: ${validCategories.join(", ")}`);
  }

  return category;
}

async function getOptionItems(category) {
  const normalizedCategory = validateCategory(category);
  return await optionRepository.findOptionItemsByCategory(normalizedCategory);
}

module.exports = {
  validateOptionItem,
  getOptionItems,
};
