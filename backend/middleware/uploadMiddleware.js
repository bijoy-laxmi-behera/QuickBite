const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) return next();

    // Use "menu" folder for menu routes, "profiles" for everything else
    const folder = req.originalUrl.includes("/menu") ? "menu" : "profiles";

    const result = await cloudinary.uploader.upload(req.file.path, { folder });

    fs.unlinkSync(req.file.path);

    req.fileData = {
      imageUrl: result.secure_url,
      public_id: result.public_id,
    };

    next();
  } catch (error) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Upload failed" });
  }
};

module.exports = uploadToCloudinary;