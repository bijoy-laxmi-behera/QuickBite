const User=require("../models/userModel");
const MenuItem=require("../models/menuItem");
const Restaurant=require("../models/Restaurant");
const Category=require("../models/Category");
const Order = require("../models/Order");
const Transaction=require("../models/Transaction");
const Review=require("../models/Review");
const Notification=require("../models/Notification");
const { mark } = require("framer-motion/client");
const cloudinary=require("cloudinary").v2;
// GET ALL RESTAURANTS
const getRestaurants=async(req,res)=>{
  try{
    const {cuisine}=req.query;
    let filter={};
    if (cuisine) filter.cuisine=cuisine;
    const restaurants=await Restaurant.find(filter);
    res.json(restaurants);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// SEARCH
const searchRestaurants=async(req,res)=>{
  try{
    const {q}=req.query;
    const data=await Restaurant.find({
      $or:[
        {name:{$regex:q,$options:"i"}},
        {cuisine:{$regex:q,$options:"i"}},
      ],
    });
    res.json(data);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// NEARBY
const getNearbyRestaurants=async(req,res)=>{
  try{
    const {lat,lng,radius=5000}=req.query;
    lat=parseFloat(lat);
    lng=parseFloat(lng);
    const restaurants=await Restaurant.find({
      location:{
        $near:{
          $geometry:{
            type:"Point",
            coordinates:[lng,lat],
          },
          $maxDistance:radius,
        },
      },
    });
    res.json(restaurants);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DETAILS
const getRestaurantById=async(req,res)=>{
  try{
    const restaurant=await Restaurant.findById(req.params.id);
    if(!restaurant)
      return res.status(404).json({message:"Not found"});
    res.json(restaurant);
    }catch(error){
      res.status(500).json({message:error.message});
    }
};
// MENU (GROUPED BY CATEGORY)
const getMenu=async(req,res)=>{
  try{
    const restaurantId=req.params.id;
    const items=await MenuItem.find({restaurant:restaurantId}).populate("category");
    const grouped={};
    items.forEach(item=>{
      const cat=item.category?.name||"Others";
      if(!grouped[cat]) grouped[cat]=[];
        grouped[cat].push(item);
    });
    res.json(grouped);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// REVIEWS
const getReviews=async(req,res)=>{
  try{
    const reviews=await Review.find({
      restaurant:req.params.id,
    });
    res.json(reviews);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// SEARCH MENU ITEMS
const searchMenu=async(req,res)=>{
  try{
    const {q}=req.query;
    const items=await MenuItem.find({
      name:{$regex:q,$options:"i"},
    }).populate("restaurant category");
    res.json(items);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET SINGLE ITEM
const getMenuItem=async(req,res)=>{
  try{
    const item=await MenuItem.findById(req.params.itemId)
      .populate("restaurant")
      .populate("category");
    if (!item) return res.status(404).json({message:"Item not found"});
    res.json(item);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ALL CATEGORIES
const getCategories=async(req,res)=>{
  try{
    const categories=await Category.find();
    res.json(categories);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TRENDING ITEMS
const getTrendingItems=async(req,res)=>{
  try{
    const today=new Date();
    today.setHours(0,0,0,0);
    const trending=await Order.aggregate([
      {
        $match:{
          createdAt:{$gte:today},
        },
      },
      {$unwind:"$items"},
      {
        $group:{
          _id:"$items.menuItem",
          totalOrders:{$sum:"$items.quantity"},
        },
      },
      {$sort:{totalOrders:-1}},
      {$limit:10},
      {
        $lookup:{
          from:"menuitems",
          localField:"_id",
          foreignField:"_id",
          as:"item",
        },
      },
      {$unwind:"$item"},
    ]);
    res.json(trending);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET PROFILE
const getProfile=async(req,res)=>{
  try{
    const user=await User.findById(req.user._id).select("-password");
    res.status(200).json({
      success:true,
      user,
    });
    }catch(error){
      res.status(500).json({message:error.message});
    }
};
//  UPDATE PROFILE
const updateProfile=async(req,res)=>{
  try{
    const{name,email,phone}=req.body;
    const user=await User.findById(req.user._id);
    if(!user){
      return res.status(404).json({message:"User not found"});
    }
    user.name=name||user.name;
    user.email=email||user.email;
    user.phone=phone||user.phone;
    const updatedUser=await user.save();
    res.status(200).json({
      success:true,
      user:updatedUser,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELETE CUSTOMER ACCOUNT
const deleteProfile=async(req,res)=>{
  try{
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({
      success:true,
      message:"Account deleted successfully",
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPLOAD OR UPDATE PROFILE PICTURE
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.avatar = req.file.path; 
    await user.save();

    res.status(200).json({
      success: true,
      avatar: user.avatar,
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
// ADD ADDRESS
const addAddress=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({
      message:"Address added successfully",
      addresses:user.addresses,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ALL ADDRESSES
const getAddresses=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    res.json(user.addresses);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELETE ADDRESS
const deleteAddress=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    user.addresses=user.addresses.filter(
      (addr)=>addr._id.toString()!==req.params.id
    );
    await user.save();
    res.json({message:"Address removed"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE ADDRESS
const updateAddress=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    const address=user.addresses.id(req.params.id);
    if(!address){
      return res.status(404).json({message:"Address not found"});
    }
    Object.assign(address,req.body);
    await user.save();
    res.json({
      message:"Address updated",
      address,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// SET DEFAULT ADDRESS
const setDefaultAddress=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    user.addresses.forEach((addr)=>{
      addr.isDefault=false;
    });
    const address=user.addresses.id(req.params.id);
    if(!address){
      return res.status(404).json({message:"Address not found"});
    }
    address.isDefault=true;
    await user.save();
    res.json({
      message:"Default address set",
      address,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET CART
const getCart=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id).populate("cart.items.menuItem");
    res.json(user.cart);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// ADD ITEM TO CART
const addToCart=async(req,res)=>{
  try{
    const {menuItem,quantity=1,customization}=req.body;
    const user=await User.findById(req.user.id);
    const existingItem=user.cart.items.find(
      (item)=>item.menuItem.toString()===menuItem
    );
    if(existingItem){
      existingItem.quantity+=quantity;
    }else{
      user.cart.items.push({menuItem,quantity,customization});
    }
    await user.save();
    res.json({message:"Added to cart",cart:user.cart});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE ITEM
const updateCartItem=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    const item=user.cart.items.id(req.params.id);
    if(!item){
      return res.status(404).json({message:"Item not found"});
    }
    item.quantity=req.body.quantity||item.quantity;
    item.customization=req.body.customization||item.customization;
    await user.save();
    res.json({message:"Cart updated",cart:user.cart});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELETE ITEM
const removeCartItem=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    user.cart.items=user.cart.items.filter(
      (item)=>item._id.toString()!==req.params.id
    );
    await user.save();
    res.json({message:"Item removed",cart:user.cart});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// CLEAR CART
const clearCart=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    user.cart.items=[];
    user.cart.totalAmount=0;
    user.cart.coupon=null;
    await user.save();
    res.jaon({message:"Cart cleared"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// APPLY COUPON
const applyCoupon=async(req,res)=>{
  try{
    const {code}=req.body;
    const user=await User.findById(req.user.id);
    if(code==="SAVE10"){
      user.cart.coupon=code;
      user.cart.totalAmount=user.cart.totalAmount*0.9;
    }else{
      return res.status(400).json({message:"Invalid coupon"});
    }
    await user.save();
    res.json({message:"Coupon applied",cart:user.cart});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// PLACE ORDER
const placeOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("cart.items.menuItem");
    if (!user.cart.items.length) {
      return res.status(400).json({ message: "Cart empty" });
    }
    const defaultAddress = user.addresses.find(addr => addr.isDefault);
    if (!defaultAddress) {
      return res.status(400).json({ message: "No default address" });
    }
    const totalAmount=user.cart.items.reduce(
      (sum,item)=>sum+item.menuItem.price*item.quantity,0
    );
    const order = await Order.create({
      user: user._id,
      vendor: user.cart.items[0].menuItem.vendor,
      items: user.cart.items,
      totalAmount,
      address: defaultAddress,
    });
    const defaultPayment = user.paymentMethods.find(m => m.isDefault);
    await Transaction.create({
      user: user._id,
      order: order._id,
      amount: user.cart.totalAmount,
      status: "success",
      paymentMethod: defaultPayment || {},
    });
    await Notification.create({
      user: user._id,
      title: "Order Placed",
      message: "Your order has been placed successfully",
      type: "order",
    });
    user.cart.items = [];
    user.cart.totalAmount = 0;
    user.cart.coupon = null;
    await user.save();
    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET ALL ORDERS
const getOrders=async(req,res)=>{
  try{
    const orders=await Order.find({user:req.user.id})
      .populate("items.menuItem")
      .sort({createdAt:-1});
    res.json(orders);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ORDER BY ID
const getOrderById=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id).populate("items.menuItem");
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    res.json(order);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TRACK ORDER
const trackOrder=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id);
    res.json({
      status:order.status,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// CANCEL OREDR
const cancelOrder=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id);
    if(oredr.status!=="pending"){
      return res.status(400).json({message:"Cannot cancel this order"});
    }
    order.status="cancelled",
    await order.save();
    res.json({message:"Order cancelled"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// REORDER
const reorder=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id);
    const user=await User.findById(req.user.id);
    user.cart.items=order.items;
    user.cart.totalAmount=order.totalAmount;
    await user.save();
    res.json({message:"Items added back to cart"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET PAYMENT METHODS
const getPaymentMethods=async(req,res)=>{
  const user=await User.findById(req.user.id);
  res.json(user.paymentMethods);
};
// ADD PAYMENT METHOD
const addPaymentMethod=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    user.paymentMethods.push(req.body);
    await user.save();
    res.status(201).json({
      message:"Payment method added",
      methods:user.paymentMethods,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELETE PAYMENT METHOD
const removePaymentMethod=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    user.paymentMethods=user.paymentMethods.filter(
      (m)=>m._id.toString()!==req.params.id
    );
    await user.save();
    res.jaon({message:"Payment method removed"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// SET DEFAULT 
const setDefaultPayment=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    user.paymentMethods.forEach((m)=>{
      m.isDefault=false;
    });
    const method=user.paymentMethods.id(req.params.id);
    if(!method){
      return res.status(404).json({message:"Not found"});
    }
    method.isDefault=true;
    await user.save();
    res.json({message:"Default payment set",method});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TRANSACTIONS
const getTransactions=async(req,res)=>{
  try{
    const transactions=await Transaction.find({user:req.user.id})
      .sort({createdAt:-1});
    res.json(transactions);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// ADD REVIEW
const addReview=async(req,res)=>{
  try{
    const {rating,comment}=req.body;
    const order=await Order.findById(req.params.id);
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    const existing=await Review.findOne({
      user:req.user.id,
      order:order._id,
    });
    if(existing){
      return res.status(400).json({message:"Already reviewed"});
    }
    const review=await Review.create({
      user:req.user.id,
      order:order._id,
      vendor:order.vendor,
      menuItem:order.items[0].menuItem,
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
// GET MY REVIEWS
const getMyReviews=async(req,res)=>{
  try{
    const reviews=await Review.find({user:req.user.id})
      .populate("menuItem")
      .sort({createdAt:-1});
    res.json(reviews);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
//UPDATE REVIEW
const updateReview=async(req,res)=>{
  try{
    const review=await Review.findById(req.params.id);
    if(!review){
      return res.status(404).json({message:"Review not found"});
    }
    if(review.user.toString()!==req.user.id){
      return res.status(403).json({message:"Unauthorized"});
    }
    review.rating=req.body.rating||review.rating;
    review.comment=req.body.comment||review.comment;
    await review.save();
    res.json({
      message:"Review updated",
      review,
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
    if(review.user.toString()!==req.user.id){
      return res.status(403).json({message:"Unauthorized"});
    }
    await review.deleteOne();
    res.json({message:"Review deleted"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET NOTIFICATIONS
const getNotifications=async(req,res)=>{
  try{
    const notifications=await Notification.find({user:req.user.id})
      .sort({createdAt:-1});
    res.json(notifications);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// MARK ONE AS READ
const markAsRead=async(req,res)=>{
  try{
    const notification=await Notification.findById(req.params.id);
    if(!notification){
      return res.status(404).json({message:"Not found"});
    }
    notification.isRead=true;
    await notification.save();
    res.json({message:"Marked as read"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// MARK ALL AS READ
const markAllAsRead=async(req,res)=>{
  try{
    await Notification.updateMany(
      {user:req.user.id},
      {isRead:true}
    );
    res.json({message:"All notifications marked as read"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE PREFERENCES
const updateNotificationPreferences=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    user.notificationPreferences={
      ...user.notificationPreferences,
      ...req.body,
    };
    await user.save();
    res.json({
      message:"Preferences updated",
      preferences:user.notificationPreferences,
    });
  }catch(error){
    res.status(500).json({message:"error.message"});
  }
};
// GET FAVOURITES
const getFavourites=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id)
      .populate("favourites");
    res.json(user.favourites);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// ADD TO FAVOURITES
const addFavourite = async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.user.id);
    if (user.favourites.some(fav => fav.toString() === itemId)) {
      return res.status(400).json({ message: "Already in favourites" });
    }
    user.favourites.push(itemId);
    await user.save();
    res.json({
      message: "Added to favourites",
      favourites: user.favourites,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// REMOVE FROM FAVOURITES
const removeFavourite=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    user.favourites=user.favourites.filter(
      (item)=>item.toString()!==req.params.id
    );
    await user.save();
    res.json({
      message:"Removed from favourites",
      favourites:user.favourites,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
module.exports={
  getProfile,
  updateProfile,
  deleteProfile,
  updateAvatar,
  getRestaurants,
  searchRestaurants,
  getNearbyRestaurants,
  getRestaurantById,
  getMenu,
  getReviews,
  searchMenu,
  getMenuItem,
  getCategories,
  getTrendingItems,
  addAddress,
  getAddresses,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  placeOrder,
  getOrders,
  getOrderById,
  trackOrder,
  cancelOrder,
  reorder,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPayment,
  getTransactions,
  addReview,
  getMyReviews,
  updateReview,
  deleteReview,
  getNotifications,
  markAsRead,
  markAllAsRead,
  updateNotificationPreferences,
  getFavourites,
  addFavourite,
  removeFavourite
};