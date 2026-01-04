const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "voiceocean_admin_secret";

module.exports = function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // OPTIONAL: role check
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
