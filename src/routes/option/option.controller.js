const optionService = require("./option.service");

async function getOptionItems(req, res) {
  const { category } = req.query;

  try {
    const items = await optionService.getOptionItems(category);
    res.json(items);
  } catch (error) {
    console.error("Error fetching option items:", error);
    res.status(400).json({
      error: "Bad Request",
      message: error.message,
    });
  }
}

module.exports = {
  getOptionItems,
};
