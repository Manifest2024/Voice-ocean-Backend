const connection = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "voiceocean_admin_secret";

exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const sql = "SELECT * FROM admin_users WHERE email = ? AND is_active = 1";

  connection.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = results[0];

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  });
};

exports.changeAdminPassword = async (req, res) => {
  const adminId = req.admin.id; // from JWT
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current password and new password required" });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  const sql = "SELECT password FROM admin_users WHERE id = ? AND is_active = 1";

  connection.query(sql, [adminId], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      results[0].password
    );

    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateSql =
      "UPDATE admin_users SET password = ? WHERE id = ?";

    connection.query(
      updateSql,
      [hashedPassword, adminId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to update password" });
        }

        res.status(200).json({
          message: "Password updated successfully",
        });
      }
    );
  });
};