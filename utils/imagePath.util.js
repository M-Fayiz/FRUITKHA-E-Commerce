const path = require("path");

const isHttpUrl = (value = "") => /^https?:\/\//i.test(String(value));

const normalizeStoredImagePath = (value = "") => {
  if (!value) return "";

  const normalized = String(value).replace(/\\/g, "/");

  if (isHttpUrl(normalized) || normalized.startsWith("/")) {
    return normalized;
  }

  const imagesIndex = normalized.lastIndexOf("/images/");
  if (imagesIndex !== -1) {
    return normalized.slice(imagesIndex);
  }

  const fileName = path.basename(normalized);
  return `/images/${fileName}`;
};

const getUploadImagePath = (file) => {
  if (!file) return "";

  if (file.path && isHttpUrl(file.path)) {
    return file.path;
  }

  if (file.filename) {
    return `/images/${file.filename}`;
  }

  if (file.path) {
    return normalizeStoredImagePath(file.path);
  }

  return "";
};

module.exports = {
  normalizeStoredImagePath,
  getUploadImagePath,
};
