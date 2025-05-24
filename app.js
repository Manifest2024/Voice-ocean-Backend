const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const Routes = require("./routes/routes");
const connection = require("./db.js");

const port = process.env.PORT || 3003;
const app = express();

// Load SSL Certificates (Replace with real certs in production)
const options = {
  key: fs.readFileSync("key.pem"),    // SSL private key
  cert: fs.readFileSync("cert.pem"),  // SSL certificate
  ca: fs.readFileSync('my_cert.crt')  // Trusted CA
};

app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, "dist")));
app.use("/voice_samples", express.static("voice_samples"));
app.use("/client_images", express.static("client_images"));

// Middleware to log requests
app.use((req, res, next) => {
  req.requestTime = new Date().toTimeString();
  console.log(req.headers);
  next();
});

// API Routes
app.get("/", (req, res) => res.status(200).json("success"));
app.get("/server", (req, res) => res.send("server is running"));
app.use("/", Routes);

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Database Connection
connection.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("Database connection successful");

    // Start HTTPS Server
    https.createServer(options, app).listen(port, () => {
      console.log(`HTTPS Server listening on port ${port}`);
    });
  }
});
