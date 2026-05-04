const mongoose=require("mongoose");
const Order=require("../models/Order");
const Review=require("../models/Review");
const MenuItem=require("../models/menuItem");
const cloudinary=require("../config/cloudinary");
const Category=require("../models/Category");
const Inventory=require("../models/Inventory");
const Payout=require("../models/payoutModel");
const User=require("../models/userModel");
const Restaurant = require("../models/Restaurant");
const Razorpay=require("razorpay");
const { GrTransaction } = require("react-icons/gr");
const Coupon = require("../models/Coupon");
const Setting=require("../models/Setting");
const razorpay=new Razorpay({
  key_id:process.env.RAZORPAY_KEY,
  key_secret:process.env.RAZORPAY_SECRET,
});
// GET ALL USERS
const getAllUsers=async(req,res)=>{
  try{
    const users=await User.find()
      .select("-password")
      .skip((page-1)*limit)
      .limit(limit)
      .sort({createdAt:-1});
    const total=await User.countDocuments();
    res.status(200).json({
      success:true,
      total,
      page,
      users,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET USERS BY ID
const getUserById=async(req,res)=>{
  try{
    const user=await User.findById(req.params.id).select("-password");
    if(!user)
      return res.status(404).json({message:"User not found"});
    res.json(user);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE USER
const updateUser=async(req,res)=>{
  try{
    const {name,email,phone}=req.body;
    const user=await User.findById(req.params.id);
    if(!user)
      return res.status(404).json({message:"User not found"});
    user.name=name||user.name;
    user.email=name||user.email;
    user.phone=phone||user.phone;
    const updatedUser=await user.save();
    res.json({
      message:"User updated",
      user:updatedUser,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELETE USER
const deleteUser=async(req,res)=>{
  try{
    const user=await User.findById(req.params.id);
    if(!user)
      return res.status(404).json({message:"User not found"});
    await user.deleteOne();
    res.json({message:"User deleted successfully"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// BLOCK USER
const blockUser=async(req,res)=>{
  try{
    const user=await User.findById(req.params.id);
    if(!user)
      return res.status(404).json({message:"User not found"});
    user.isBlocked=true;
    await user.save();
    res.json({message:"User blocked"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UNBLOCK USER
const unblockUser=async(req,res)=>{
  try{
    const user=await User.findById(req.params.id);
    if(!user)
      return res.status(404).json({message:"User not found"});
    user.isBlocked=false;
    await user.save();
    res.json({message:"User unblocked"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// USER STATS
const getUserStats=async(req,res)=>{
  try{
    const totalUsers=await User.countDocumnets();
    const blockedUsers=await User.countDocuments({isBlocked:true});
    res.json({
      totalUsers,
      blockedUsers
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET OWN PROFILE
const getMyProfile=async(req,res)=>{
  try{
    const admin=await User.findById(req.user.id).select("-password");
    if(!admin){
      return res.status(404).json({message:"Admin not found"});
    }
    res.json({
      success:true,
      admin,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
const updateMyProfile=async(req,res)=>{
  try{
    const {name,email,phone}=req.body;
    const admin=await User.findById(req.user.id);
    if(!admin){
      return res.status(404).json({message:"Admin not found"});
    }
    admin.name=name||admin.name;
    admin.email=email||admin.email;
    admin.phone=phone||admin.phone;
    await admin.save();
    res.json({
      success:true,
      message:"Profile updated successfully",
      admin:{
        _id:admin._id,
        name:admin.name,
        email:admin.email,
        phone:admin.phone,
      },
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ALL RESTAURANTS
const getAllRestaurants=async(req,res)=>{
  try{
    const restaurants=await Restaurant.find({isActive:true})
      .sort({createdAt:-1});
    res.json(restaurants);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET SINGLE RESTAURANTS
const getRestaurantById=async(req,res)=>{
  try{
    const restaurant=await Restaurant.findById(req.params.id);
    if(!restaurant){
      return res.status(404).json({message:"Restaurant not found"});
    }
    res.json(restaurant);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// CREATE RESTAURANT
const createRestaurant=async(req,res)=>{
  try{
    const restaurant=await Restaurant.create(req.body);
    res.status(201).json({
      message:"Restaurant created",
      restaurant,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE RESTAURANT
const updateRestaurant=async(req,res)=>{
  try{
    const restaurant=await Restaurant.findById(req.params.id);
    if(!restaurant){
      return res.status(404).json({message:"Not found"});
    }
    Object.assign(restaurant,req.body);
    await restaurant.save();
    res.json({
      message:"Restaurant updated",
      restaurant,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELETE RESTAURANT
const deleteRestaurant=async(req,res)=>{
  try{
    const restaurant=await Restaurant.findById(req.params.id);
    if(!restaurant){
      return res.status(404).json({message:"Not found"});
    }
    await restaurant.deleteOne();
    res.json({message:"Restaurant deleted"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TOGGLE STATUS
const toggleRestaurantStatus=async(req,res)=>{
  try{
    const restaurant=await Restaurant.findById(req.params.id);
    if(!restaurant){
      return res.status(404).json({message:"Not found"});
    }
    restaurant.isActive=!restaurant.isActive;
    await restaurant.save();
    res.json({
      message:"Status updated",
      isActive:restaurant.isActive,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ORDERS BY RESTAURANT
const getRestaurantOrders=async(req,res)=>{
  try{
    const orders=await Order.find({
      restaurant:req.params.id,
    })
      .populate("user","name")
      .sort({createdAt:-1});
    res.json({
      count:orders.length,
      orders,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET MENU FOR A RESTAURANT
const getRestaurantMenu=async(req,res)=>{
  try{
    const {id}=req.params;
    const restaurant=await Restaurant.findById(id);
    if(!restaurant){
      return res.status(404).json({message:"Restaurant not found"});
    }
    const items=await MenuItem.find({
      restaurant:id,
      isAvailable:true,
    })
      .populate("category","name")
      .sort({createdAt:-1});
      res.json({
        count:items.length,
        items,
      });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// SEARCH MENU ITEMS
const searchMenuItems=async(req,res)=>{
  try{
    const {q}=req.query;
    if(!q){
      return res.status(400).json({message:"Search query required"});
    }
    const items=await MenuItem.find({
      name:{$regex:q,$options:"i"},
      isAvailable:true,
    })
      .populate("restaurant","name")
      .populate("category","name");
    res.json({
      count:items.length,
      items,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// CREATE MENU ITEM
const createMenuItem=async(req,res)=>{
  try{
    const {name,price,restaurant,category}=req.body;
    if(!name||!price||!restaurant||!category){
      return res.status(400).json({message:"Missing required fields"});
    }
    const item=await MenuItem.create({
      name,
      price,
      restaurant,
      category,
      description:req.body.description,
      image:req.file?req.file.path:null,
    });
    res.status(201).json({
      message:"Menu item created",
      item,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE MENU ITEM
const updateMenuItem=async(req,res)=>{
  try{
    const item=await MenuItem.findById(req.params.id);
    if(!item){
      return res.status(404).json({message:"Item not found"});
    }
    item.name=req.body.name||item.name;
    item.price=req.body.price||item.price;
    item.category=req.body.category||item.category;
    item.description=req.body.description||item.description;
    if(req.file){
      item.image=req.file.path;
    }
    await item.save();
    res.json({
      message:"Menu item updated",
      item,
    });
  }catch(error){
    res.status(500).json({message:erroe.message});
  }
};
// DELETE MENU ITEM
const deleteMenuItem=async(req,res)=>{
  try{
    const item=await MenuItem.findById(req.params.id);
      if(!item){
        return res.status(404).json({message:"Item not found"});
      }
      await item.deleteOne();
      res.json({message:"Menu item deleted"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TOGGLE AVAILABILITY
const toggleAvailability=async(req,res)=>{
  try{
    const item=await MenuItem.findById(req.params.id);
    if(!item){
      return res.status(404).json({message:"Item not found"});
    }
    item.isAvailable=!item.isAvailable;
    await item.save();
    res.json({
      message:"Availability updated",
      isAvailable:item.isAvailable,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// PLACE ORDER
const placeOrder=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id)
      .populate("cart.items.menuItem");
    if(!user||!user.cart?.items?.length){
      return res.status(400).json({message:"Cart is empty"});
    }
    const defaultAddress=user.addresses.find(a=>a.isDefault);
    if(!defaultAddress){
      return res.status(400).json({message:"No default address"});
    }
    const vendorId=user.cart.items.reduce((sum,i)=>{
      return sum+i.menuItem.price*i.quantity;
    },0);
    const order=await Order.create({
      user:user._id,
      vendor:vendorId,
      items:user.cart.items.map(i=>({
        menuItem:i.menuItem._id,
        name:i.menuItem.name,
        price:i.menuItem.price,
        quantity:i.quantity,
      })),
      totalAmount,
      address:defaultAddress,
      status:"pending",
    });
    user.cart.items=[];
    user.cart.totalAmount=0;
    user.cart.coupon=null;
    await user.save();
    res.status(201).json({
      message:"Order placed",
      order,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ORDER DETAILS
const getOrderById=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id)
      .populate("items.menuItem")
      .populate("user","name email");
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    if(order.user._id.toString()!==req.user.id && req.user.role!=="admin"){
      return res.status(403).json({message:"Unauthorized"});
    }
    res.json(order);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET MY ORDERS
const getMyOrders=async(req,res)=>{
  try{
    const orders=await Order.find({user:req.user.id})
      .populate("items.menuItem")
      .sort({createdAt:-1});
    res.json({
      count:orders.length,
      orders,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// CANCEL ORDER
const cancelOrder=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id);
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    if(order.user.toString()!==req.user.id){
      return res.status(403).json({message:"Unauthorized"});
    }
    if(order.status!=="pending"){
      return res.status(400).json({message:"Cannot cancel this order"});
    }
    order.status="cancelled";
    await order.save();
    res.json({message:"Order cancelle",order});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// LIST ALL ORDERS(FILTERABLE)
const getAllOrders=async(req,res)=>{
  try{
    const {status,date}=req.query;
    const filter={};
    if(status) filter.status=status;
    if(date){
      const start=new Date(date);
      start.setHours(0,0,0,0);
      const end=new Date(date);
      end.setHours(0,0,0,0);
      filter.createdAt={$gte:start,$lte:end};
    }
    const orders=await Order.find(filter)
      .populate("user","name")
      .sort({createdAt:-1});
    res.json({
      count:orders.length,
      orders,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE ORDER STATUS
const updateOrderStatus=async(req,res)=>{
  try{
    const {status}=req.body;
    const validStatus=[
      "pending",
      "accepted",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];
    if(!validStatuses.includes(status)){
      return res.status(400).json({message:"Invalid status"});
    }
    const order=await Order.findById(req.params.id);
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    order.status=status;
    await order.save();
    res.json({
      message:"Order status updated",
      order,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ALL LIVE/ACTIVE ORDERS
const getLiveOrders=async(req,res)=>{
  try{
    const orders=await Order.find({
      status:{$in:["pending","accepted","preparing","out_for_delivery"]},
    })
      .populate("user","name")
      .sort({createdAt:-1});
    res.json({
      count:orders.length,
      orders,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ALL DELIVERY AGENTS
const getAllAgents=async(req,res)=>{
  try{
    const agents=await User.find({role:"deliveryPartner"})
      .select("-password")
      .sort({createdAt:-1});
    res.json({
      count:agents.length,
      agents,
    });
}catch(error){
  res.status(500).json({message:error.message});
  }
};
// CREATE DELIVERY AGENT
const createAgent=async(req,res)=>{
  try{
    const {name,email,password,phone}=req.body;
    const agent=await User.create({
      name,
      email,
      password,
      phone,
      role:"deliveryPartner",
    });
    res.status(201).json({
      message:"Agent created",
      agent,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE AGENT
const updateAgent=async(req,res)=>{
  try{
    const agent=await User.findById(req.params.id);
    if(!agent||agent.role!=="deliveryPartner"){
      return res.status(404).json({message:"Agent not found"});
    }
    agent.name=req.body.name||agent.name;
    agent.email=req.body.email||agent.email;
    agent.phone=req.body.phone||agent.phone;
    await agent.save();
    res.json({
      message:"Agent updated",
      agent,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELETE AGENT
const deleteAgent=async(req,res)=>{
  try{
    const agent=await User.findById(req.params.id);
    if(!agent||agent.role!=="deliveryPartner"){
      return res.status(404).json({message:"Agent not found"});
    }
    await agent.deleteOne();
    res.json({message:"Agent deleted"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TOGGLE ONLINE/OFFLINE
const toggleAgentStatus=async(req,res)=>{
  try{
    const agent=await User.findById(req.params.id);
    if(!agent||agent.role!=="deliveryPartner"){
      return res.status(404).json({message:"Agent not found"});
    }
    agent.isOnline=!agent.isOnline;
    await agent.save();
    res.json({
      message:"Status updated",
      isOnline:agent.isOnline,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// ASSIGN AGENT TO ORDER
const assignAgentToOrder=async(req,res)=>{
  try{
    const {agentId}=req.body;
    const order=await Order.findById(req.params.id);
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    const agent=await User.findById(agentId);
    if(!agent||agent.role!=="deliveryPartner"){
      return res.status(404).json({message:"Agent not found"});
    }
    if(!agent.isOnline){
      return res.status(400).json({message:"Agent is offline"});
    }
    order.deliveryAgent=agent._id;
    order.status="out_for_delivery";
    agent.currentOrder=order._id;
    await order.save();
    await agent.save();
    res.json({
      message:"Agent assigned",
      order,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELIVERY HISTORY
const getAgentDeliveries=async(req,res)=>{
  try{
    const orders=await Order.find({
      deliveryAgent:req.params.id,
    })
      .populate("user","name")
      .sort({createdAt:-1});
    res.json({
      count:orders.length,
      orders,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// INITIATE PAYMENT
const initiatePayment=async(req,res)=>{
  try{
    const {orderId}=req.body;
    const order=await Order.findById(orderId);
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    const options={
      amount:order.totalAmount*100,
      currency:"INR",
      receipt:order._id.toString(),
    };
    const razorpayOrder=await razorpay.orders.create(options);
    res.json({
      orderId:razorpayOrder.id,
      amount:razorpayOrder.amount,
      currency:razorpayOrder.currency,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// VERIFY PAYMENT
const verifyPayment=async(req,res)=>{
  try{
    const{
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    }=req.body;
    const body=razorpay_order_id+"|"+razorpay_payment_id;
    const expectedSignature=crypto
      .createHmac("sha256",process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");
    if(expectedSignature!==razorpay_signature){
      return res.status(400).json({message:"Invalid payment"});
    }
    const order=await Order.findById(orderId);
    order.paymentStatus="paid";
    await order.save();
    await GrTransaction.create({
      user:order.user,
      order:order._id,
      amount:order.totalAmount,
      status:"success",
      paymentMethod:"online",
    });
    res.json({message:"Payment verified successfully"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ALL TRANSACTIONS
const getAllPayments=async(req,res)=>{
  try{
    const payments=await GrTransaction.find()
      .populate("user","name")
      .populate("order")
      .sort({createdAt:-1});
    res.json({
      count:payments.length,
      payments,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
}
// GET SINGLE TRANSACTION
const getPaymentById=async(req,res)=>{
  try{
    const payment=await Transaction.findById(req.params.id)
      .populate("user","name")
      .populate("order");
    if(!payment){
      return res.status(404).json({message:"Transaction not found"});
    }
    res.json(payment);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// REFUND PAYMENT 
const refundPayment=async(req,res)=>{
  try{
    const payment=await Transaction.findById(req.params.id);
    if(!payment){
      return res.status(404).json({message:"Transaction not found"});
    }
    payment.status="failed";
    await payment.save();
    res.json({message:"Refund processed (simulated"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// SUMMARY
const getPaymentSummary=async(req,res)=>{
  try{
    const totalRevenue=await Transaction.aggreagate([
      {$match:{status:"success"}},
      {$group:{_id:null,total:{$sum:"$amount"}}},
    ]);
    const totalTransactions=await Transaction.countDocuments();
    res.json({
      totalRevenue:totalRevenue[0]?.total||0,
      totalTransactions,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// VALIDATE COUPON
const validateCoupon=async(req,res)=>{
  try{
    const {code,amount}=req.body;
    const coupon=await Coupon.findOne({code:code.toUpperCase()});
    if(!coupon || !coupon.isActive){
      return res.status(400).json({message:"Invalid coupon"});
    }
    if(coupon.expiresAt && coupon.expiresAt<new Date()){
      return res.status(400).json({message:"Coupon expired"});
    }
    if(coupon.usageLimit && coupon.usedCount>=coupon.usageLimit){
      return res.status(400).json({message:"Coupon limit reached"});
    }
    if(amount<coupon.minOrderAmount){
      return res.status(400).json({
        message:`Minimum order amount is ₹${coupon.minOrderAmount} `,
      });
    }
    let discount=0;
    if(coupon.discountType==="flat"){
      discount=coupon.discountValue;
    }else{
      discount=(amount*coupon.discountValue)/100;
      if(coupon.maxDiscount){
        discount=Math.min(discount,coupon.maxDiscount);
      }
    }
    res.json({
      valid:true,
      discount,
      finalAmount:mount-discount,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ALL COUPONS
const getAllCoupons=async(req,res)=>{
  try{
    const coupons=await Coupon.find().sort({createdAt:-1});
    res.json({
      count:coupons.length,
      coupons,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// CREATE COUPON
const createCoupon=async(req,res)=>{
  try{
    const coupon=await Coupon.create(req.body);
    res.status(201).json({
      message:"Coupon created",
      coupon,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE COUPON
const updateCoupon=async(req,res)=>{
  try{
    const coupon=await Coupon.findById(req.params.id);
    if(!coupon){
      return res.status(404).json({message:"Coupon not found"});
    }
    Object.assign(coupon,req.body);
    await coupon.save();
    res.json({
      message:"Coupon updated",
      coupon,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELETE COUPON
const deleteCoupon=async(req,res)=>{
  try{
    const coupon=await Coupon.findById(req.params.id);
    if(!coupon){
      return res.status(404).json({message:"Coupon not found"});
    }
    await coupon.deleteOne();
    res.json({message:"Coupon deleted"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TOGGLE ACTIVE
const toggleCoupon=async(req,res)=>{
  try{
    const coupon=await Coupon.findById(req.params.id);
    if(!coupon){
      return res.status(404).json({message:"Coupon not found"});
    }
    coupon.isActive=!coupon.isActive;
    await coupon.save();
    res.json({
      message:"Coupon status updated",
      isActive:coupon.isActive,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// OVERVIEW
const getOverview=async(req,res)=>{
  try{
    const totalOrders=await Order.countDocuments();
    const totalUsers=await User.countDocuments({role:"user"});
    const totalRestaurants=await User.countDocuments({role:"vendor"});
    const revenueData=await Order.aggregate([
      {$match:{status:"delivered"}},
      {$group:{_id:null,total:{$sum:"$totalAmount"}}},
    ]);
    res.json({
      totalOrders,
      totalUsers,
      totalRestaurants,
      totalRevenue:revenueData[0]?.total||0,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// REVENUE
const getRevenueAnalytics=async(req,res)=>{
  try{
    const {startDate,endDate}=req.query;
    const match={
      status:"delivered",
    };
    if(startDate && endDate){
      match.createdAt={
        $gte:new Date(startDate),
        $lte:new Date(endDate),
      };
    }
    const revenue=await Order.aggregate([
      {$match:match},
      {
        $group:{
          _id:{
            year:{$year:"$createdAt"},
            month:{$month:"$createdAt"},
            day:{$dayOfMonth:"$createdAt"},
          },
          totalRevenue:{$sum:"$totalAmount"},
        },
      },
      {$sort:{"_id.year":1,"_id.month":1,"_id.day":1}},
    ]);
    res.json(revenue);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// ORDER STATS
const getOrderAnalytics=async(req,res)=>{
  try{
    const stats=await Order.aggregate([
      {
        $group:{
          _id:"$status",
          count:{$sum:1},
        },
      },
    ]);
    res.json(stats);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TOP RESTAURANTS
const getTopRestaurants=async(req,res)=>{
  try{
    const top=await Order.aggregate([
      {$match:{status:"delivered"}},
      {
        $group:{
          _id:"$vendor",
          totalOrders:{$sum:1},
          revenue:{$sum:"$totalAmount"},
        },
      },
      {$sort:{revenue:-1}},
      {$limit:5},
      {
        $lookup:{
          from:"users",
          localField:"_id",
          foreignField:"_id",
          as:"restaurant",
        },
      },
      {
        $unwind:"$restaurant"
      }
    ]);
    res.json(top);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// PEAK HOURS
const getPeakHours=async(req,res)=>{
  try{
    const data=await Order.aggregate([
      {
        $group:{
          _id:{hour:{$hour:"$createdAt"}},
          totalOrders:{$sum:1},
        },
      },
      {$sort:{"_id.hour":1}},
    ]);
    res.json(data);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// RATE ORDER
const rateOrder=async(req,res)=>{
  try{
    const {rating,comment}=req.body;
    const order=await Order.findById(req.params.id);
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    if(order.user.toString()!==req.user.id){
      return res.status(403).json({message:"Unauthorized"});
    }
    if(order.status!=="delivered"){
      return res.status(400).json({
        message:"You can only rate delivered orders",
      });
    }
    const existing=await Review.findOne({
      user:req.user.id,
      order:order._id,
    });
    if(existing){
      return res.status(400).json({
        message:"You already rated this order",
      });
    }
    const review=await review.create({
      user:req.user.id,
      order:order._id,
      vendor:order.vendor,
      restaurant:order.restaurant,
      rating,
      comment,
    });
    res.status(201).json({
      message:"Review submitted",
      review,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET RESTAURANT RATINGS
const getRestaurantRatings=async(req,res)=>{
  try{
    const reviews=await Review.find({
      restaurant:req.params.id,
    })
      .populate("user","name")
      .sort({createdAt:-1});
    const avg=await Review.aggregate([
      {$match:{restaurant:req.params.id}},
      {
        $group:{
          _id:null,
          avgRating:{$avg:"$rating"},
        },
      },
    ]);
    res.json({
      count:reviews.length,
      avgRating:ang[0]?.avgRating||0,
      reviews,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELETE REVIEW
const deleteReview=async(req,res)=>{
  try{
    const review=await Review.findById(req.params.id);
    if(!review){
      return res.status(404).json({message:"Review not found"});
    }
    await review.deleteOne();
    res.json({message:"Review removed"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET SETTINGS
const getSettings=async(req,res)=>{
  try{
    let settings=await Setting.findOne();
    if(!settings){
      settings=await Setting.create({});
    }
    res.json(settings);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE SETTINGS
const updateSettings=async(req,res)=>{
  try{
    let settings=await Setting.findOne();
    if(!settings){
      settings=await Setting.create({});
    }
    const allowedFields=[
      "deliveryFee",
      "serviceFee",
      "taxRate",
      "maxDeliveryDistance",
      "currency",
      "maintenanceMode",
      "supportEmail",
      "allowCOD",
      "allowOnlinePayment",
    ];
    allowedFields.forEach((field)=>{
      if(req.body[field]!==undefined){
        settings[field]=req.body[field];
      }
    });
    await settings.save();
    res.json({
      message:"Settings updated",
      settings,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
module.exports={
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  getUserStats,
  getMyProfile,
  updateMyProfile,
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleRestaurantStatus,
  getRestaurantOrders,
  getRestaurantMenu,
  searchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  placeOrder,
  getOrderById,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getLiveOrders,
  getAllAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  toggleAgentStatus,
  assignAgentToOrder,
  getAgentDeliveries,
  initiatePayment,
  verifyPayment,
  getAllPayments,
  getPaymentById,
  refundPayment,
  getPaymentSummary,
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  getOverview,
  getRevenueAnalytics,
  getOrderAnalytics,
  getTopRestaurants,
  getPeakHours,
  rateOrder,
  getRestaurantRatings,
  deleteReview,
  getSettings,
  updateSettings
};