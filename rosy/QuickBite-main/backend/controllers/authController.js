const User=require("../models/userModel");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");
const sendEmail=require("../utils/sendEmail");
const {
  generateAccessToken,
  generateRefreshToken,
}=require("../utils/generateTokens");
const {otpTemplate}=require("../utils/emailTemplates");
//REGISTER
const register=async(req,res)=>{
  try{
    const {name,email,password}=req.body;
    if(!name||!email||!password){
      return res.status(400).json({message:"All fields are required"});
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }
    const emailLower=email.toLowerCase();
    const userExists=await User.findOne({email:emailLower});
    if(userExists){
      return res.status(400).json({message:
      "User already exists"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user=await User.create({
      name,
      email,
      password:hashedPassword,
    });
    await sendEmail(
      emailLower,
      "Welcome to Our QuickBite 🍔",
      `<div style="margin:0;padding:0;background:#fff8f0;font-family:Arial,Helvetica,sans-serif;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" 
        style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:15px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#ff512f,#f09819);padding:35px 20px;text-align:center;color:#ffffff;">
            <h1 style="margin:0;font-size:28px;">QuickBite 🍕</h1>
            <p style="margin:8px 0 0;font-size:15px;">Fast. Fresh. Delivered.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:30px 25px;text-align:center;color:#333;">
            <h2 style="color:#ff512f;margin-bottom:15px;">Hey ${name}! 👋</h2>
            <p style="font-size:16px;line-height:1.6;margin-bottom:20px;">
              Welcome to <b>QuickBite</b>! 🎉  
              Your account has been successfully created.
            </p>
            <p style="font-size:15px;color:#666;margin-bottom:30px;">
              Discover delicious meals 🍔🍕, order instantly,  
              and enjoy lightning-fast delivery 🚀
            </p>
            <a href="http://localhost:4000"
              style="display:inline-block;padding:14px 30px;background:#28a745;color:#ffffff;text-decoration:none;border-radius:30px;font-weight:bold;font-size:15px;">
              Order Now 🛒
            </a>
          </td>
        </tr>
        <tr>
          <td style="background:#fff3cd;padding:20px;text-align:center;color:#856404;">
            <p style="margin:0;font-size:14px;">
              🎁 Get exciting offers & discounts on your first order!
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fa;padding:20px;text-align:center;font-size:13px;color:#777;">
            © 2026 QuickBite | Made with ❤️ for food lovers <br/>
            This is an automated email, please do not reply.
          </td>
        </tr>
      </table>
    </div>
    `,
    );
    res.status(201).json({
      message:"User registered successfully",
      user:{
        _id:user._id,
        name:user.name,
        email:user.email,
      },
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
//LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict", // ✅ fixed
    });

    res.json({
      message: "Login successful",
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// CREATE REFRESH TOKEN
const refreshAccessToken=async(req,res)=>{
  try{
    const token=req.cookies.refreshToken;
    if(!token){
      return res.status(401).json({message:"No refresh token"});
    }
    const decoded=jwt.verify(token,process.env.JWT_REFRESH_SECRET);
    const user=await User.findById(decoded.id);
    if(!user||user.refreshToken!==token){
      return res.status(403).json({message:"Invalid refresh token"});
    }
    const newAccessToken=jwt.sign(
      {id:user._id,role:user.role},
      process.env.JWT_SECRET,
      {expiresIn:"15m"}
    );
    res.json({accessToken:newAccessToken});
  }catch(error){
    res.status(403).json({message:"Token expired or invalid"});
  }
}
// FORGOT PASSWORD
const forgotPassword=async(req,res)=>{
  try{
    const {email}=req.body;
    const user=await User.findOne({email:email.toLowerCase()});
    if(!user){
      return res.status(400).json({message:"User not found"});
    }
    const otp=Math.floor(100000+Math.random()*900000).toString();
    user.resetOTP=otp;
    user.otpExpire=Date.now()+10*60*1000;
    await user.save();
    await sendEmail(
      email,
      "Password Reset OTP",
      otpTemplate(otp)
    );
    res.json({message:"OTP sent to email"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// VERIFY OTP + RESET PASSWORD
const resetPassword=async(req,res)=>{
  try{
    const {email,otp,newPassword,confirmPassword}=req.body;
    if(newPassword!==confirmPassword){
      return res.status(400).json({message:"Passwords do not match"});
    }
    const user=await User.findOne({
      email:email.toLowerCase(),
      resetOTP:otp,
      otpExpire:{$gt:Date.now()}
    });
    if(!user){
      return res.status(400).json({message:"Invalid or expired OTP"});
    }
    user.password=newPassword;
    user.resetOTP=undefined;
    user.otpExpire=undefined;
    await user.save();
    res.json({message:"Password reset successful"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// CHANGE PASSWORD
const changePassword=async(req,res)=>{
  try{
    const {oldPassword,newPassword}=req.body;
    const user=await User.findById(req.user.id);
    const isMatch=await bcrypt.compare(oldPassword,user.password);
    if(!isMatch){
      return res.status(400).json({message:"Old password incorrect"});
    }
    user.password=newPassword;
    await user.save();
    res.json({message:"Password changed successfully"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// LOGOUT
const logout=async(req,res)=>{
  try{
    const token=req.cookies.refreshToken;
    if(token){
      const decoded=jwt.verify(token,process.env.JWT_REFRESH_SECRET);
      const user=await User.findById(decoded.id);
      if(user){
        user.refreshToken=null;
        await user.save();
      }
    }
    res.clearCookie("refreshtoken");
    res.json({message:"Logged out successfully"});
  }catch(error){
    res.json({message:"Logout done"});
  }
};
module.exports={
  register,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  changePassword,
  logout
};