const mongoose=require("mongoose");
const categorySchema=new mongoose.Schema(
  {
  name:{
    type:String,
    required:true,
    trim:true
  },
  vendor:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  image:{
    type:String
  },
  isActive:{
    type:Boolean,
    default:true
  },
  order:{
    type:Number,
    default:0
  }
},{timestamps:true}
);
module.exports=mongoose.model("Category",categorySchema);