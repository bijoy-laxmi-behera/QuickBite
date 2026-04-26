const mongoose=require("mongoose");
const Order=require("../models/Order");
const Review=require("../models/Review");
const MenuItem=require("../models/menuItem");
const cloudinary=require("../config/cloudinary");
const Category=require("../models/Category");
const Inventory=require("../models/Inventory");
const Payout=require("../models/payoutModel");
const User=require("../models/userModel");
// GET ALL RESTAURANTS
const getAllRestaurants=async(req,res)=>{
  try{
    const vendors=await User.find({role:"vendor"})
      .select("-password")
      .sort({createdAt:-1});
    res.status(200).json({
      success:true,
      count:vendors.length,
      data:vendors
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET SINGLE RESTAURANTS

module.exports={getAllRestaurants};