const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    // 🔒 Check env variables first
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials not set in .env");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"QuickBite" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully");

  } catch (error) {
    console.error("❌ Email Error:", error.message);
    throw error; // let controller handle it
  }
};

module.exports = sendEmail;