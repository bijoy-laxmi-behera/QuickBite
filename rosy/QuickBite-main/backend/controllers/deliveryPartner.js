const Order = require("../models/Order");
const User=require("../models/userModel");
const Review=require("../models/Review");
const Payout=require("../models/payoutModel");
const Notification=require("../models/Notification");
const FAQ=require("../models/FAQ");
const SupportTicket=require("../models/SupportTicket");
const getMyProfile=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id).select("-password");
    res.json(user);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE BASIC INFO
const updateProfile=async(req,res)=>{
  try{
    const {name,email,phone,vehicleType}=req.body;
    const user=await User.findById(req.user.id);
    user.name=name||user.name;
    user.email=email||user.email;
    user.phone=phone||user.phone;
    if(vehicleType){
      user.vehicle=user.vehicle||{};
      user.vehicle.type=vehicleType;
    }
    await user.save();
    res.json({message:"Profile updated",user});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// AVATAR
const updateAvatar=async(req,res)=>{
  try{
    if(!req.file){
      return res.status(400).json({message:"No file uploaded"});
    }
    const user=await User.findById(req.user.id);
    user.avatar=req.file.path;
    await user.save();
    res.json({message:"Avatar updated",avatar:user.avatar});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DOCUMENTS
const uploadDocuments=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    user.documents={
      ...user.documents,
      license:req.files?.license?.[0]?.path||user.documents?.license,
      rc:req.files?.rc?.[0]?.path||user.documents?.rc,
      idProof:req.files?.idProof?.[0]?.path||user.documents?.idProof,
    };
    await user.save();
    res.json({message:"Documents uploaded",documents:user.documents});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// VEHICLE
const updateVehicle=async(req,res)=>{
  try{
    const {type,number,model}=req.body;
    const user=await User.findById(req.user.id);
    user.vehicle={
      type:type||user.vehicle?.type,
      number:number||user.vehicle?.number,
      model:model||user.vehicle?.model,
    };
    await user.save();
    res.json({message:"Vehicle updated",vehicle:user.vehicle});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// BANK
const updateBank=async(req,res)=>{
  try{
    const {accountNumber,ifsc,accountHolderName}=req.body;
    const user=await User.findById(req.user.id);
    user.bank={
      accountNumber,
      ifsc,
      accountHolderName,
    };
    await user.save();
    res.json({message:"Bank details updated",bank:user.bank});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELETE ACCOUNT
const deleteAccount=async(req,res)=>{
  try{
    const user=await user.findById(req.user.id);
    await user.deleteOne();
    res.json({message:"Account deleted successfully"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TOGGLE STATUS
const toggleStatus=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    user.isOnline=!user.isOnline;
    await user.save();
    res.json({
      message:"Status updated",
      isOnline:user.isOnline,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET STATUS
const getStatus=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    res.json({
      isOnline:user.isOnline,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE LOCATION
const updateLocation=async(req,res)=>{
  try{
    const {lat,lng}=req.body;
    lat=parseFloat(lat);
    lng=parseFloat(lng);
    if(!lat||!lng){
      return res.status(400).json({message:"Invalid coordinates"});
    }
    const user=await User.findById(req.user.id);
    user.location={
      type:"Point",
      coordinates:["lng","lat"],
    };
    await user.save();
    res.json({
      message:"Location updated",
      location:user.location,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET LOCATION
const getLocation=async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    res.json({
      location:user.location,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// INCOMING
const getIncomingOrders=async(req,res)=>{
  try{
    const orders=await Order.find({
      deliveryStatus:"pending"
    }).sort({createdAt:-1});
    res.json({count:orders.length,orders});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// ACTIVE
const getActiveOrder=async(req,res)=>{
  try{
    const order=await Order.findOne({
      deliveryAgent:req.user.id,
      deliveryStatus:{$in:["accepted","picked_up"]}
    });
    res.json(order);
  }catch(error){
    res.status(500).json({message:rror.message});
  }
};
// GET BY ID
const getOrderById=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id)
      .populate("user","name phone")
      .populate("vendor","name");
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    res.json(order);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// ACCEPT
const acceptOrder=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id);
    if(!order||order.deliveryStatus!=="pending"){
      return res.status(400).json({message:"Order not available"});
    }
    order.deliveryAgent=req.user.id;
    order.deliveryStatus="accepted";
    await order.save();
    res.json({message:"Order accepted",order});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// REJECT
const rejectOrder=async(req,res)=>{
  try{
    const {reason}=req.body;
    const order=await Order.findById(req.params.id);
    order.deliveryStatus="rejected";
    order.rejectionReason=reason;
    await order.save();
    res.json({message:"Order rejected"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// PICKED UP
const markPickedUp=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id);
    if(order.deliveryAgent.toString()!==req.user.id){
      return res.status(403).json({message:"Unauthorized"});
    }
    order.deliveryStatus="picked_up";
    await order.save();
    res.json({message:"Order picked up"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
//  OTP VERIFY
const verifyOtp=async(req,res)=>{
  try{
    const {otp}=req.body;
    const order=await Order.findById(req.params.id);
    if(order.otp!==otp){
      return res.status(400).json({message:"Invalide OTP"});
    }
    res.json({message:"OTP verified"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELIVERED 
const markDelivered=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id);
    order.deliveryStatus="delivered";
    await order.save();
    res.json({message:"Order delivered"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
//  ISSUE
const reportIssue=async(req,res)=>{
  try{
    const {issue}=req.body;
    const order=await Order.findById(req.params.id);
    order.issue=issue;
    await order.save();
    res.json({message:"Issue reported"});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// HISTORY
const getOrderHistory=async(req,res)=>{
  try{
    const {startDate,endDate}=req.query;
    const filter={
      deliveryAgent:req.user.id,
      deliveryStatus:"delivered"
    };
    if(startDate && endDate){
      filter.createdAt={
        $gte:new Date(startDate),
        $lte:new Date(endDate),
      };
    }
    const orders=await Order.find(filter)
      .sort({createdAt:-1});
    res.json({count:orders.length,orders});
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TOTAL EARNINGS, TRIPS, AVG PER TRIP
const getEarningsSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Transaction.aggregate([
      { $match: { user: userId, status: "success" } },
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: { $add: ["$amount", { $ifNull: ["$tip", 0] }, { $ifNull: ["$bonus", 0] }] }
          },
          totalTrips: { $sum: 1 },
        },
      },
    ]);

    const totalEarnings = result[0]?.totalEarnings || 0;
    const totalTrips = result[0]?.totalTrips || 0;

    res.json({
      totalEarnings,
      totalTrips,
      avgPerTrip: totalTrips ? totalEarnings / totalTrips : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// TODAY
const getTodayEarnings = async (req, res) => {
  try {
    const userId = req.user.id;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const data = await Transaction.find({
      user: userId,
      createdAt: { $gte: start },
      status: "success",
    }).populate("order");

    res.json({
      count: data.length,
      earnings: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// LAST 7 DAYS CHART
const getWeeklyEarnings=async(req,res)=>{
  try{
    const userId=req.user.id;
    const last7Days=new Date();
    last7Days.setDate(last7Days.getDate()-6);
    last7Days.setHours(0,0,0,0);
    const data = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          status: "success",
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: {
            $sum: { $add: ["$amount", { $ifNull: ["$tip", 0] }, { $ifNull: ["$bonus", 0] }] }
          },
        },
      },
      { $sort: { "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// MONTHLY
const getMonthlyEarnings = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Transaction.aggregate([
      { $match: { user: userId, status: "success" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: {
            $sum: { $add: ["$amount", { $ifNull: ["$tip", 0] }, { $ifNull: ["$bonus", 0] }] }
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// PAYOUTS
const getPayouts=async(req,res)=>{
  try{
    const payouts=await payoutModel.find({
      vendor:req.user.id,
    }).sort({createdAt:-1});
    res.json({
      count:payouts.length,
      payouts,
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TRANSACTIONS
const getTransactions = async (req, res) => {
  try {
    const data = await Transaction.find({
      user: req.user.id,
    })
      .populate("order")
      .sort({ createdAt: -1 });

    res.json({
      count: data.length,
      transactions: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* ================= STATS ================= */
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalAssigned = await Order.countDocuments({
      deliveryAgent: userId,
    });

    const completed = await Order.countDocuments({
      deliveryAgent: userId,
      deliveryStatus: "delivered",
    });

    const accepted = await Order.countDocuments({
      deliveryAgent: userId,
      deliveryStatus: { $in: ["accepted", "picked_up", "delivered"] },
    });

    // avg delivery time
    const avgTimeData = await Order.aggregate([
      {
        $match: {
          deliveryAgent: userId,
          deliveryStatus: "delivered",
          deliveredAt: { $exists: true },
          pickedAt: { $exists: true },
        },
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ["$deliveredAt", "$pickedAt"] },
              1000 * 60, // minutes
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$duration" },
        },
      },
    ]);

    // rating
    const ratingData = await Review.aggregate([
      {
        $match: {
          vendor: userId,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    res.json({
      rating: ratingData[0]?.avgRating || 0,
      completionRate: totalAssigned
        ? (completed / totalAssigned) * 100
        : 0,
      acceptanceRate: totalAssigned
        ? (accepted / totalAssigned) * 100
        : 0,
      avgDeliveryTime: avgTimeData[0]?.avgTime || 0,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= RATINGS ================= */
const getRatings = async (req, res) => {
  try {
    const reviews = await Review.find({
      vendor: req.user.id,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= BADGES ================= */
const getBadges = async (req, res) => {
  try {
    const completed = await Order.countDocuments({
      deliveryAgent: req.user.id,
      deliveryStatus: "delivered",
    });

    const badges = [];

    if (completed >= 10) badges.push("Rookie Rider");
    if (completed >= 50) badges.push("Pro Rider");
    if (completed >= 100) badges.push("Elite Rider");

    res.json({
      totalDeliveries: completed,
      badges,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= LEADERBOARD ================= */
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Order.aggregate([
      {
        $match: {
          deliveryStatus: "delivered",
        },
      },
      {
        $group: {
          _id: "$deliveryAgent",
          totalDeliveries: { $sum: 1 },
        },
      },
      { $sort: { totalDeliveries: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "agent",
        },
      },
      { $unwind: "$agent" },
    ]);

    res.json(leaderboard);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* ================= GET ALL ================= */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      count: notifications.length,
      notifications,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= MARK ONE ================= */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Not found" });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Marked as read" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= MARK ALL ================= */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= FCM TOKEN ================= */
const saveFcmToken = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findById(req.user.id);

    user.fcmToken = token;

    await user.save();

    res.json({ message: "FCM token saved" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= PREFERENCES ================= */
const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...req.body,
    };

    await user.save();

    res.json({
      message: "Preferences updated",
      preferences: user.notificationPreferences,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* ================= FAQs ================= */
const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });

    res.json({
      count: faqs.length,
      faqs,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= CREATE TICKET ================= */
const createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        message: "Subject and message are required",
      });
    }

    const ticket = await SupportTicket.create({
      user: req.user.id,
      subject,
      message,
    });

    res.status(201).json({
      message: "Ticket created",
      ticket,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL TICKETS ================= */
const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      count: tickets.length,
      tickets,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET SINGLE TICKET ================= */
const getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(ticket);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports={
  getMyProfile,
  updateProfile,
  updateAvatar,
  uploadDocuments,
  updateVehicle,
  updateVehicle,
  updateBank,
  deleteAccount,
  toggleStatus,
  getStatus,
  updateLocation,
  getLocation,
  getIncomingOrders,
  getActiveOrder,
  getOrderById,
  acceptOrder,
  rejectOrder,
  markPickedUp,
  markDelivered,
  verifyOtp,
  reportIssue,
  getOrderHistory,
  getEarningsSummary,
  getTodayEarnings,
  getWeeklyEarnings,
  getMonthlyEarnings,
  getPayouts,
  getTransactions,
  getStats,
  getRatings,
  getBadges,
  getLeaderboard,
  getNotifications,
  markAsRead,
  markAllAsRead,
  saveFcmToken,
  updatePreferences,
  getFAQs,
  createTicket,
  getMyTickets,
  getTicketById,
};