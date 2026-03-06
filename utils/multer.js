const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary using env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store files directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:   "fruitkha",
    // Derive format from the original MIME type (works for both file inputs and canvas blobs)
    format:   file.mimetype === "image/png" ? "png" : "jpg",
    transformation: [{ width: 900, crop: "limit", quality: "auto" }],
  }),
});

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
