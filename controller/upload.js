const multer = require("multer");
const path = require("path");
const fs = require("fs");
const shortUUID = require("short-uuid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "uploads";

    switch (file.fieldname) {
      case "profile_photo":
        folder = "artist_images";
        break;

      case "image":
        folder = "blog_images";
        break;

      case "testimonial_images":
        folder = "testimonial_images";
        break;

      case "clientLogo":
        folder = "client_logos";
        break;

      case "sample":
        folder = "voice_samples";
        break;

      default:
        folder = "uploads";
    }

    const uploadPath = path.join(__dirname, `../${folder}`);
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${shortUUID.generate()}${ext}`);
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});
