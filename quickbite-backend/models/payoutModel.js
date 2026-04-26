const mongoose=require("mongoose");
const payoutSchema=new mongoose.Schema(
  {
    vendor:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
    },
    amount:{
      type:Number,
      required:true
    },
    status:{
      type:String,
      enum:["pending","paid","failed"],
      default:"pending"
    },
    payoutDate:{
      type:Date,
      default:Date.now
    },
    reference:{
      type:String
    }
  },
  {timestamps:true}
);
module.exports=mongoose.model("Payout",payoutSchema);