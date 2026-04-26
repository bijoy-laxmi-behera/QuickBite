const mongoose=require("mongoose");
const reviewSchema = new mongoose.Schema(
  {
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
  
    vendor:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
  
    menuItem:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "menuItem"
    },
  
    rating:{
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
  
    comment:{
      type: String
    }
  
  },
  { timestamps: true }
  );
module.exports=mongoose.model("Review",reviewSchema);