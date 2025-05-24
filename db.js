const mysql = require("mysql2");

// Create and export the database connection
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password10",
  database: "erp",
});

module.exports = connection;
