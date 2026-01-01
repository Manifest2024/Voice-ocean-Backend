const mysql = require("mysql2");

// Create a connection pool (IMPORTANT)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "erp",
  password: process.env.DB_PASSWORD || "password10",
  database: process.env.DB_NAME || "erp",
  port: 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test DB connection once on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL connected successfully");
    connection.release();
  }
});

module.exports = pool;
