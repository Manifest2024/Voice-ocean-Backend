const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const Routes = require("./routes/routes");
const connection = require("./db.js");

const app = express();
const PORT = process.env.PORT || 4000;

/* =======================
   Middleware
======================= */
app.use(express.json());
app.use(cors());
app.use(cookieParser());

/* =======================
   Static Files
======================= */
app.use("/voice_samples", express.static(path.join(__dirname, "voice_samples")));
app.use("/client_images", express.static(path.join(__dirname, "client_images")));
app.use("/blog_images", express.static(path.join(__dirname, "blog_images")));
app.use("/testimonial_images", express.static(path.join(__dirname, "testimonial_images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "dist")));

/* =======================
   Health / Test Routes
======================= */
app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", message: "Backend is running" });
});

app.get("/server", (req, res) => {
  res.send("Server is running");
});

/* =======================
   API Routes
======================= */
app.use("/api", Routes);

/* =======================
   Catch-all (optional)
   Use ONLY if serving frontend
======================= */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

/* =======================
   Start Server
======================= */
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
