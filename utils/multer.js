const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
const fs = require("fs");

// Configure Cloudinary using env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

const getFileExtension = (file) => {
  if (file.mimetype === "image/png") return ".png";
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    return ".jpg";
  }
  return ".jpg";
};

const localImageDir = path.join(__dirname, "..", "images");
if (!fs.existsSync(localImageDir)) {
  fs.mkdirSync(localImageDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, localImageDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${getFileExtension(file)}`);
  },
});

// Store files directly to Cloudinary when configured, otherwise fall back to local disk storage.
const storage = hasCloudinaryConfig
  ? new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => ({
        folder: "fruitkha",
        // Derive format from the original MIME type (works for both file inputs and canvas blobs)
        format: file.mimetype === "image/png" ? "png" : "jpg",
        transformation: [{ width: 900, crop: "limit", quality: "auto" }],
      }),
    })
  : localStorage;

// Accept real image uploads AND canvas blobs (which arrive as application/octet-stream)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/octet-stream", // canvas.toBlob() sends this MIME type via FormData
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Only image files are allowed. Received: ${file.mimetype}`), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
