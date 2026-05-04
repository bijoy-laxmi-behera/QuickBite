const cloudinary = require("../config/cloudinary");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "uploads",
    });

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });

  } catch (error) {
    console.error("Upload Error:", error.message);
    res.status(500).json({ message: "Upload failed" });
  }
};

module.exports = { uploadImage };