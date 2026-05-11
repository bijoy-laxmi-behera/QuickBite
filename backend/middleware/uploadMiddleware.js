const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profiles",
    });

    fs.unlinkSync(req.file.path);

    // ✅ attach data to request
    req.fileData = {
      imageUrl: result.secure_url,
      public_id: result.public_id,
    };

    next();

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Upload failed" });
  }
};

module.exports = uploadToCloudinary;