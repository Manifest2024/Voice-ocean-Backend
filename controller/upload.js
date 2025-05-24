const multer = require("multer");
const shortUUID = require("short-uuid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "voice_samples");
  },
  filename: function (req, file, cb) {
    const sampleId = shortUUID.generate();
    const ext = file.originalname.split(".").pop();
    cb(null, sampleId + "." + ext);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
