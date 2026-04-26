const mongoose=require("mongoose");
const userSchema=new mongoose.Schema(
  {
    name:{
      type:String,
      required:true,
      trim:true,
      match:[/^[A-Za-z\s]+$/,"Name should contain only letters"],
    },
    email:{
      type:String,
      required:true,
      unique:true,
    },
    password:{
      type:String,
      required:true
    },
    role:{
      type:String,
      enum:["user","vendor","delivery-partner","admin"],
      default:"user"
    },
    resetOTP:{
      type:String
    },
    otpExpire:{
      type:Date
    },
    restaurantName:String,
    cuisine:String,
    address:String,
    logo:String,
    isOpen:{
      type:Boolean,
      default:true,
    },
    deliverySettings:{
      radius:Number,
      minOrder:Number,
      avgPrepTime:Number
    },
    bankDetails:{
      accountNumber:String,
      ifsc:String,
      bankName:String,
      accountHolderName:String
    },
    operatingHours: {
      monday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true }
      },
      tuesday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true }
      },
      wednesday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true }
      },
      thursday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true }
      },
      friday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true }
      },
      saturday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true }
      },
      sunday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true }
      }
    },
  },{timestamps:true}
);
module.exports=mongoose.model("User",userSchema);