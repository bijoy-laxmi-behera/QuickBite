const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadImage = async (req, res) => {
  try {
    // ✅ Check file exists
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path); // delete invalid file
      return res.status(400).json({ message: "Only images are allowed" });
    }

    // ✅ Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "uploads",
    });

    // ✅ Delete file after upload
    fs.unlinkSync(req.file.path);

    // ✅ Response
    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });

  } catch (error) {
    console.error("Upload Error:", error);

    // ✅ Cleanup if error occurs
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
};

module.exports = { uploadImage };