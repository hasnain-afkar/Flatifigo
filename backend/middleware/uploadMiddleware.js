const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .toLowerCase();
    cb(null, `${Date.now()}-${safeBase}${path.extname(file.originalname)}`);
  },
});

const imageFileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed."));
  }
  cb(null, true);
};

const mediaFileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
    return cb(new Error("Only image and video uploads are allowed."));
  }
  cb(null, true);
};

const limits = {
  fileSize: Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024,
};

const upload = multer({ storage, fileFilter: imageFileFilter, limits });
upload.messageMedia = multer({ storage, fileFilter: mediaFileFilter, limits });

module.exports = upload;
