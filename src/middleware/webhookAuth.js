const { timingSafeEqual } = require("crypto");

function webhookAuth(req, res, next) {
  const secret = req.headers["x-webhook-secret"];
  const expectedSecret = process.env.PAYMENTS_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error("PAYMENTS_WEBHOOK_SECRET environment variable is not set");
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Webhook authentication is not configured",
    });
  }

  if (!secret) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing webhook secret",
    });
  }

  if (secret.length !== expectedSecret.length) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing webhook secret",
    });
  }

  try {
    const secretBuffer = Buffer.from(secret, "utf8");
    const expectedBuffer = Buffer.from(expectedSecret, "utf8");
    if (!timingSafeEqual(secretBuffer, expectedBuffer)) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing webhook secret",
      });
    }
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing webhook secret",
    });
  }

  next();
}

module.exports = { webhookAuth };
