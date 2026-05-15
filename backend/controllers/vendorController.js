const mongoose=require("mongoose");
const Order=require("../models/Order");
const Review=require("../models/Review");
const MenuItem=require("../models/menuItem");
const Category=require("../models/Category");
const Inventory=require("../models/Inventory");
const Payout=require("../models/payoutModel");
const User=require("../models/userModel");
const Restaurant=require("../models/Restaurant");
const Notification=require("../models/Notification");
const cloudinary=require("../config/cloudinary");
// OVERVIEW
const getOverview=async(req,res)=>{
  try{
    const vendorId=req.user._id;
    const todayStart=new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd=new Date();
    todayEnd.setHours(23,59,59,999);
    const orders=await Order.find({
      vendor:vendorId,
      createdAt:{$gte:todayStart,$lte:todayEnd}
    });
    const totalOrders=orders.length;
    const revenue=orders.reduce((sum,order)=>{
      return order.status==="delivered" ? sum+order.totalAmount : sum;
    },0);
    const avgPrepTime=
    orders.reduce((sum,o)=>sum+(o.prepTime||0),0)/
    (orders.length||1);
    const rating=await Review.aggregate([
      {$match:{vendor:new mongoose.Types.ObjectId(vendorId)}},
      {$group:{_id:null,avgRating:{$avg:"$rating"}}}
    ]);
    res.json({
      success:true,
      data:{
        totalOrders,
        revenue,
        avgPrepTime:Math.round(avgPrepTime),
        rating:rating[0]?.avgRating||0
      },
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// LIVE ORDERS
const getLiveOrders=async(req,res)=>{
  try{
    const vendorId=req.user._id;
    const orders=await Order.find({
      vendor:new mongoose.Types.ObjectId(vendorId),
      status:{$in:["new","accepted","preparing"]}
    })
      .populate("user","name")
      .sort({createdAt:-1});
    res.json({
      success:true,
      count:orders.length,
      orders
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TOP ITEMS
const getTopItems=async(req,res)=>{
  try{
    const vendorId=req.user._id;
    const weekStart=new Date();
    weekStart.setDate(weekStart.getDate()-7);
    const topItems=await Order.aggregate([
      {
        $match:{
          vendor:new mongoose.Types.ObjectId(vendorId),
          createdAt:{$gte:weekStart}
        }
      },
      {$unwind:"$items"},
      {
        $group:{
          _id:"$items.menuItem",
          totalSold:{$sum:"$items.quantity"}
          }
        },
        {$sort:{totalSold:-1}},
        {$limit:5}
    ]);
    res.json({
      success:true,
      items:topItems
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// OREDR STATS 
const getOrderStats=async(req,res)=>{
  try{
    const vendorId=req.user._id;
    const todayStart=new Date();
    todayStart.setHours(0,0,0,0);
    const stats=await Order.aggregate([
      {
        $match:{
          vendor:new mongoose.Types.ObjectId(vendorId),
          createdAt:{$gte:todayStart}
        }
      },
      {
        $group:{
          _id:"$status",
          count:{$sum:1}
        }
      }
    ]);
    res.json({
      success:true,
      stats
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
}
// WEEKLY REVENUE
const getWeeklyRevenue=async(req,res)=>{
  try{
    const vendorId=req.user._id;
    const weekStart=new Date();
    weekStart.setDate(weekStart.getDate()-7);
    const revenue=await Order.aggregate([
      {
        $match:{
          vendor:new mongoose.Types.ObjectId(vendorId),
          status:"completed",
          createdAt:{$gte:weekStart}
        }
      },
      {
        $group:{
          _id:{
            $dateToString:{
              format:"%Y-%m-%d",
              date:"$createdAt"
            }
          },
          totalRevenue:{$sum:"$totalAmount"}
        }
      },
      {
        $sort:{_id:1}
      }
    ]);
    res.json({
      success:true,
      revenue
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// LIST ALL ORDERS
const getVendorOrders=async(req,res)=>{
  try{
    const vendorId=req.user._id;
    const {status,date}=req.query;
    let query={vendor:new mongoose.Types.ObjectId(vendorId)};
    if(status){
      query.status=status;
    }
    if(date){
      const start=new Date(date);
      start.setHours(0,0,0,0);
      const end=new Date(date);
      end.setHours(23,59,59,999);
      query.createdAt={$gte:start,$lte:end};
    }
    const orders=await Order.find(query)
      .populate("user","name phone")
      .sort({createdAt:-1});
    res.json({
      success:true,
      count:orders.length,
      orders
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ORDER DETAIL
const getOrderDetail=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id)
      .populate("user","name phone email");
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    res.json({
      success:true,
      order
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// ACCEPT ORDER
const acceptOrder=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id);
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    order.status="accepted";
    await order.save();
    res.json({
      success:true,
      message:"Order accepted",
      order
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// REJECT ORDER
const rejectOrder=async(req,res)=>{
  try{
    const {reason}=req.body;
    const order=await Order.findById(req.params.id);
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    order.status="cancelled";
    order.rejectReason=reason;
    await order.save();
    res.json({
      success:true,
      message:"Order rejected",
      order
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// MARK ORDER READY
const markOrderReady=async(req,res)=>{
  try{
    const order=await Order.findById(req.params.id);
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    if(order.vendor.toString()!==req.user.id)
      return res.status(403).json({message:"Not authorized"});
    order.status="out_for_delivery";
    await order.save();
    res.json({
      success:true,
      message:"Order ready for delivery",
      order
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE PREPARATION TIME
const updatePrepTime=async(req,res)=>{
  try{
    const {prepTime}=req.body;
    const order=await Order.findById(req.params.id);
    if(!order){
      return res.status(404).json({message:"Order not found"});
    }
    order.prepTime=prepTime;
    await order.save();
    res.json({
      success:true,
      message:"Preparation time updated",
      order
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// ORDER HISTORY
const getOrderHistory=async(req,res)=>{
  try{
    const vendorId=req.user._id;
    const orders=await Order.find({
      vendor:new mongoose.Types.ObjectId(vendorId),
      status:{$in:["completed","cancelled"]}
    })
      .populate("user","name")
      .sort({createdAt:-1});
    res.json({
      success:true,
      count:orders.length,
      orders
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ALL MENU ITEMS
const getMenu=async(req,res)=>{
  try{
    const items=await MenuItem.find({
      vendor:req.user._id
    }).sort({createdAt:-1});
    res.json({
      success:true,
      count:items.length,
      items
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET SINGLE MENU ITEM
const getMenuItem=async(req,res)=>{
  try{
    const item=await MenuItem.findOne({
      _id:req.params.id,
      vendor:req.user._id
    });
    if(!item){
      return res.status(404).json({message:"Menu item not found"});
    }
    res.json({
      success:true,
      item
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// backend/controllers/vendorController.js - Updated createMenuItem

const createMenuItem = async (req, res) => {
  try {
    console.log("=== CREATE MENU ITEM ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Vendor ID:", req.user._id);

    const { name, description, price, category, isveg, preparationTime, isAvailable } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Menu item name is required"
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required"
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required"
      });
    }

    // Verify the category exists and belongs to this vendor
    const categoryExists = await Category.findOne({
      _id: category,
      vendor: req.user._id
    });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category selected"
      });
    }

    // Prepare menu item data (without restaurant)
    const menuData = {
      name: name.trim(),
      description: description || '',
      price: Number(price),
      category: category,
      vendor: req.user._id,
      isAvailable: isAvailable === 'true' || isAvailable === true,
      isveg: isveg === 'true' || isveg === true,
      preparationTime: preparationTime ? Number(preparationTime) : 30,
      stock: -1, // Unlimited
      rating: 0,
      totalReviews: 0
    };

    // Try to get restaurant ID if available (optional)
    const vendor = await User.findById(req.user._id).select('restaurantId restaurant');
    const restaurantId = vendor?.restaurantId || vendor?.restaurant;
    
    if (restaurantId) {
      menuData.restaurant = restaurantId;
    }

    // Handle image upload
    if (req.file) {
      if (req.file.path) {
        menuData.image = req.file.path;
      }
      if (req.fileUrl) {
        menuData.image = req.fileUrl;
      }
    }

    console.log("Creating menu item with data:", menuData);

    const menuItem = await MenuItem.create(menuData);

    // Update category item count
    await Category.findByIdAndUpdate(category, {
      $inc: { itemCount: 1 }
    });

    console.log("Menu item created successfully:", menuItem);

    res.status(201).json({
      success: true,
      data: menuItem,
      message: "Menu item created successfully"
    });

  } catch (error) {
    console.error("Error in createMenuItem:", error);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create menu item"
    });
  }
};
const updateMenuItem = async (req, res) => {
  try {
    console.log("=== UPDATE MENU ITEM ===");
    console.log("Item ID:", req.params.id);
    console.log("Request body:", req.body);

    const { name, description, price, category, isveg, preparationTime, isAvailable } = req.body;

    // Find the menu item
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    // Check authorization
    if (menuItem.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this item"
      });
    }

    // If category is changing, update item counts
    if (category && category !== menuItem.category.toString()) {
      // Decrement old category count
      await Category.findByIdAndUpdate(menuItem.category, {
        $inc: { itemCount: -1 }
      });
      // Increment new category count
      await Category.findByIdAndUpdate(category, {
        $inc: { itemCount: 1 }
      });
      menuItem.category = category;
    }

    // Update fields
    if (name) menuItem.name = name.trim();
    if (description !== undefined) menuItem.description = description;
    if (price) menuItem.price = Number(price);
    if (isveg !== undefined) menuItem.isveg = isveg === 'true' || isveg === true;
    if (preparationTime) menuItem.preparationTime = Number(preparationTime);
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable === 'true' || isAvailable === true;

    // Handle image upload if present
    if (req.file) {
      if (req.file.path) {
        menuItem.image = req.file.path;
      }
      if (req.fileUrl) {
        menuItem.image = req.fileUrl;
      }
    }

    await menuItem.save();

    console.log("Menu item updated successfully:", menuItem);

    res.status(200).json({
      success: true,
      data: menuItem,
      message: "Menu item updated successfully"
    });

  } catch (error) {
    console.error("Error in updateMenuItem:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update menu item"
    });
  }
};
// DELETE MENU ITEM
const deleteMenuItem=async(req,res)=>{
  try{
    const menu=await MenuItem.findById(req.params.id);
    if(!menu){
      return res.status(404).json({message:"Menu item not found"});
    }
    if(menu.vendor.toString()!==req.user._id.toString()){
      return res.status(403).json({message:"Not authorized"});
    }
    if(menu.image){
      const publicId=menu.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`uploads/${publicId}`);
    }
    await menu.deleteOne();
    res.status(200).json({
      success:true,
      message:"Menu item deleted successfully"
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TOGGLE AVAILABILITY
const toggleAvailability=async(req,res)=>{
  try{
    const menu=await MenuItem.findById(req.params.id);
    if(!menu){
      return res.status(404).json({message:"Menu item not found"});
    }
    if(menu.vendor.toString()!==req.user._id.toString()){
      return res.status(403).json({
        message:"Not authorized"
      });
    }
    menu.isAvailable=!menu.isAvailable;
    await menu.save();
    res.status(200).json({
      success:true,
      message:"Menu availability updated",
      data:menu
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE PRICE
const updateMenuPrice=async(req,res)=>{
  try{
    const menu=await MenuItem.findById(req.params.id);
    if(!menu){
      return res.status(404).json({message:"Menu item not found"});
    }
    if(menu.vendor.toString()!==req.user._id.toString()){
      return res.status(403).json({
        message:"Not authorized"
      });
    }
    if(!req.body.price){
      return res.status(400).json({
        message:"Price is required"
      });
    }
    menu.price=req.body.price;
    await menu.save();
    res.status(200).json({
      success:true,
      message:"Menu price updated",
      data:menu
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// BULK AVAILABILITY
const bulkMenuAvailability = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Request body is required"
      });
    }

    const { menuIds, isAvailable } = req.body;

    if (!menuIds || menuIds.length === 0) {
      return res.status(400).json({
        message: "Menu IDs are required"
      });
    }

    await MenuItem.updateMany(
      { _id: { $in: menuIds }, vendor: req.user._id },
      { $set: { isAvailable } }
    );

    res.status(200).json({
      success: true,
      message: "Menu availability updated successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// backend/controllers/vendorController.js - Updated Category Functions

// CREATE CATEGORY - FIXED
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    console.log("Creating category for vendor:", req.user._id);
    console.log("Category name:", name);

    // Check if category already exists for this vendor
    const existing = await Category.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
      vendor: req.user._id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists"
      });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Prepare category data
    const categoryData = {
      name: name.trim(),
      description: description || '',
      vendor: req.user._id,
      slug: slug,
      isActive: true,
      order: 0
    };

    // Try to get restaurant ID if available (optional)
    const vendor = await User.findById(req.user._id).select('restaurantId restaurant');
    if (vendor && (vendor.restaurantId || vendor.restaurant)) {
      categoryData.restaurant = vendor.restaurantId || vendor.restaurant;
      console.log("Restaurant ID found:", categoryData.restaurant);
    } else {
      console.log("No restaurant associated with vendor yet");
    }

    const category = await Category.create(categoryData);

    console.log("Category created successfully:", category);

    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully"
    });

  } catch (error) {
    console.error("Error in createCategory:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL CATEGORIES - FIXED
const getCategories = async (req, res) => {
  try {
    console.log("Fetching categories for vendor:", req.user._id);
    
    // Build query without requiring restaurant
    const query = { vendor: req.user._id };
    
    // Try to add restaurant filter only if available
    const vendor = await User.findById(req.user._id).select('restaurantId restaurant');
    if (vendor && (vendor.restaurantId || vendor.restaurant)) {
      query.restaurant = vendor.restaurantId || vendor.restaurant;
    }
    
    const categories = await Category
      .find(query)
      .sort({ order: 1, createdAt: -1 });
    
    console.log("Categories found:", categories.length);
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error("Error in getCategories:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE CATEGORY - FIXED
const updateCategory = async (req, res) => {
  try {
    const { name, description, isActive, order } = req.body;
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }
    
    if (category.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized" 
      });
    }
    
    if (name && name !== category.name) {
      // Check for duplicate name
      const existing = await Category.findOne({
        name: { $regex: `^${name.trim()}$`, $options: "i" },
        vendor: req.user._id,
        _id: { $ne: req.params.id }
      });
      
      if (existing) {
        return res.status(400).json({ 
          success: false,
          message: "Category with this name already exists" 
        });
      }
      
      category.name = name.trim();
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;
    
    await category.save();
    
    res.status(200).json({
      success: true,
      data: category,
      message: "Category updated successfully"
    });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
// backend/controllers/vendorController.js - Fix deleteCategory

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    console.log("Deleting category:", categoryId);
    console.log("Vendor ID:", req.user._id);
    
    // Find the category
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }
    
    // Check authorization
    if (category.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to delete this category" 
      });
    }
    
    // Check if category has menu items - FIX THIS PART
    // Try multiple possible field names
    let menuExists = null;
    
    try {
      // Try with category name
      menuExists = await MenuItem.findOne({ 
        category: category.name,
        vendor: req.user._id 
      });
      
      // If not found, try with categoryId
      if (!menuExists) {
        menuExists = await MenuItem.findOne({ 
          categoryId: categoryId,
          vendor: req.user._id 
        });
      }
      
      // If not found, try with category object id reference
      if (!menuExists) {
        menuExists = await MenuItem.findOne({ 
          category: categoryId,
          vendor: req.user._id 
        });
      }
    } catch (menuError) {
      console.log("Error checking menu items:", menuError.message);
      // Continue with deletion if check fails
    }
    
    if (menuExists) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot delete category with menu items. Please reassign or delete the items first." 
      });
    }
    
    // Delete the category
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    
    if (!deletedCategory) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found during deletion" 
      });
    }
    
    console.log("Category deleted successfully:", deletedCategory.name);
    
    res.status(200).json({
      success: true,
      message: `Category "${deletedCategory.name}" deleted successfully`
    });
    
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to delete category"
    });
  }
};
// TOGGLE CATEGORY VISIBILITY - FIXED
const toggleCategoryVisibility = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }
    
    if (category.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized" 
      });
    }
    
    category.isActive = !category.isActive;
    await category.save();
    
    res.status(200).json({
      success: true,
      message: `Category ${category.isActive ? 'shown' : 'hidden'} successfully`,
      data: category
    });
  } catch (error) {
    console.error("Error in toggleCategoryVisibility:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// REORDER CATEGORIES - FIXED
const reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: "Categories array is required"
      });
    }

    for (let i = 0; i < categories.length; i++) {
      const categoryId = categories[i].id || categories[i];
      await Category.findOneAndUpdate(
        { _id: categoryId, vendor: req.user._id },
        { order: i }
      );
    }

    res.status(200).json({
      success: true,
      message: "Categories reordered successfully"
    });

  } catch (error) {
    console.error("Error in reorderCategories:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// ADD INGREDIENT
const addIngredient=async(req,res)=>{
  try{
    const {name,quantity,unit,threshold}=req.body;
    if(!name){
      return res.status(400).json({
        message:"Ingredient name is required"
      });
    }
    const existing=await Inventory.findOne({
      name:{$regex:`^${name}$`,$options:"i"},
      vendor:req.user._id
    });
    if(existing){
      return res.status(400).json({
        message:"Ingredient already exists"
      });
    }
    const ingredient=await Inventory.create({
      name,
      quantity,
      unit,
      threshold,
      vendor:req.user._id
    });
    res.status(201).json({
      success:true,
      data:ingredient
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET ALL INGREDIENTS
const getIngredients=async(req,res)=>{
  try{
    const ingredients=await Inventory
      .find({vendor:req.user._id})
      .sort({createdAt:-1});
    res.status(200).json({
      success:true,
      count:ingredients.length,
      data:ingredients
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// UPDATE INGREDIENT
const updateIngredient=async(req,res)=>{
  try{
    const {name,quantity,unit,threshold}=req.body;
    const ingredient=await Inventory.findById(req.params.id);
    if(!ingredient){
      return res.status(404).json({message:"Ingredient not found"});
    }
    if(ingredient.vendor.toString()!==req.user._id.toString()){
      return res.status(403).json({
        message:"Not authorized"
      });
    }
    if(name){
      const existing=await Inventory.findOne({
        name:{$regex:`^${name}$`,$options:"i"},
        vendor:req.user._id,
        _id:{$ne:req.params.id}
      });
      if(existing){
        return res.status(400).json({
          message:"Ingredient already exists"
        });
      }
    }
    ingredient.name=name||ingredient.name;
    ingredient.quantity=quantity??ingredient.quantity;
    ingredient.unit=unit||ingredient.unit;
    ingredient.threshold=threshold??ingredient.threshold;
    await ingredient.save();
    res.status(200).json({
      success:true,
      data:ingredient
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// DELETE INGREDIENT
const deleteIngredient=async(req,res)=>{
  try{
    const ingredient=await Inventory.findById(req.params.id);
    if(!ingredient){
      return res.status(404).json({
        message:"Ingredient not found"
      });
    }
    if(ingredient.vendor.toString()!==req.user._id.toString()){
      return res.status(403).json({
        message:"Not authorized"
      });
    }
    await ingredient.deleteOne();
    res.status(200).json({
      success:true,
      message:"Ingredient deleted successfully"
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// LOW STOCK INGREDIENTS
const getLowStockIngredients = async (req, res) => {
  try {

    const ingredients = await Inventory.find({
      vendor: req.user._id,
      $expr: { $lte: ["$quantity", "$threshold"] }
    }).sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
const restockIngredient = async (req, res) => {
  try {

    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Valid quantity is required"
      });
    }

    const ingredient = await Inventory.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        message: "Ingredient not found"
      });
    }

    // Check vendor ownership
    if (ingredient.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    // Increase stock
    ingredient.quantity += quantity;

    await ingredient.save();

    res.status(200).json({
      success: true,
      message: "Ingredient restocked successfully",
      data: ingredient
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// EARNINGS SUMMARY
const getEarningsSummary = async (req, res) => {
  try {

    const vendorId = req.user._id;

    const completedOrders = await Order.find({
      vendor: vendorId,
      status: "completed"
    });

    const totalOrders = completedOrders.length;

    const totalEarnings = completedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const today = new Date();
    today.setHours(0,0,0,0);

    const todayOrders = completedOrders.filter(
      order => new Date(order.createdAt) >= today
    );

    const todayEarnings = todayOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalEarnings,
        todayEarnings
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// REVENUE TREND
const getRevenueTrend=async(req,res)=>{
  try{
    const vendorId=req.user._id;
    const trend=await Order.aggregate([
      {
        $match:{
          vendor:new mongoose.Types.ObjectId(vendorId),
          status:"completed"
        }
      },
      {
        $group:{
          _id:{
            year:{$year:"$createdAt"},
            month:{$month:"$createdAt"},
            day:{$dayOfMonth:"$createdAt"}
          },
          revenue:{$sum:"$totalAmount"},
          orders:{$sum:1}
        }
      },
      {
        $sort:{"_id.year":1,"_id.month":1,"_id.day":1}
      }
    ]);
    res.status(200).json({
      success:true,
      data:trend
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// PAYOUT HISTORY
const getPayoutHistory=async(req,res)=>{
  try{
    const payouts=await Payout
      .find({vendor:req.user._id})
      .sort({createdAt:-1});
    res.status(200).json({
      success:true,
      count:payouts.length,
      data:payouts
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// PAYOUT DETAIL
const getPayoutDetail=async(req,res)=>{
  try{
    const payout=await Payout.findById(req.params.id);
    if(!payout){
      return res.status(404).json({
        message:"Payout not found"
      });
    }
    if(payout.vendor.toString()!==req.user._id.toString()){
      return res.status(403).json({
        message:"Not authorized"
      });
    }
    res.status(200).json({
      success:true,
      data:payout
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// TRANSACTION BREAKDOWN
const getTransactionBreakdown=async(req,res)=>{
  try{
    const payout=await Payout.findById(req.params.id);
    if(!payout){
      return res.status(404).json({
        message:"Payout not found"
      });
    }
    if(payout.vendor.toString()!==req.user._id.toString()){
      return res.status(403).json({
        message:"Not authorized"
      });
    }
    const orders=await Order.find({
      _id:{$in:payout.orders}
    });
    const totalRevenue=orders.reduce(
      (sum,order)=>sum+order.totalAmount,0
    );
    const platformFee=totalRevenue*0.1;
    const tax=totalRevenue*0.05;
    const netPayout=totalRevenue-platformFee-tax;
    res.status(200).json({
      success:true,
      data:{
        totalRevenue,
        platformFee,
        tax,
        netPayout,
        orders
      }
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// LIST ALL REVIEWS 
const getVendorReviews=async(req,res)=>{
  try{
    const reviews=await Review
      .find({vendor:req.user._id})
      .populate("user","name")
      .sort({createdAt:-1});
    res.status(200).json({
      success:true,
      count:reviews.length,
      data:reviews
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// REVIEW RATING SUMMARY
const getReviewSummary=async(req,res)=>{
  try{
    const vendorId=req.user._id;
    const summary=await Review.aggregate([
      {
        $match:{vendor:new mongoose.Types.ObjectId(vendorId)}
      },
      {
        $group:{
          _id:"$rating",
          count:{$sum:1}
        }
      }
    ]);
    const totalReviews=summary.reduce((sum,item)=>sum+item.count,0);
    const avgRatingData=await Review.aggregate([
      {$match:{vendor:new mongoose.Types.ObjectId(vendorId)}},
      {
        $group:{
          _id:null,
          avgRating:{$avg:"$rating"}
        }
      }
    ]);
    const avgRating=avgRatingData[0]?.avgRating||0;
    const distribution={
      5:0,
      4:0,
      3:0,
      2:0,
      1:0
    };
    summary.forEach(item=>{
      distribution[item._id]=item.count;
    });
    res.status(200).json({
      success:true,
      data:{
        averageRating:avgRating.toFixed(1),
        totalReviews,
        distribution
      }
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// POST REPLY TO REVIEW
const replyToReview=async(req,res)=>{
  try{
    const {reply}=req.body;
    if(!reply){
      return res.status(400).json({
        message:"Reply message is required"
      });
    }
    const review=await Review.findById(req.params.id);
    if(!review){
      return res.status(404).json({
        message:"Review not found"
      });
    }
    if(review.vendor.toString()!==req.user._id.toString()){
      return res.status(403).json({
        message:"Not authorized"
      });
    }
    review.reply=reply;
    await review.save();
    res.status(200).json({
      success:true,
      message:"Reply added successfully",
      data:review
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// EDIT VENDOR REPLY
const editReviewReply=async(req,res)=>{
  try{
    const {reply}=req.body;
    if(!reply){
      return res.status(400).json({
        message:"Reply is required"
      });
    }
    const review=await Review.findById(req.params.id);
    if(!review){
      return res.status(404).json({
        message:"Review not found"
      });
    }
    if(review.vendor.toString()!==req.user._id.toString()){
      return res.status(403).json({
        message:"not authorized"
      });
    }
    review.reply=reply;
    await review.save();
    res.status(200).json({
      success:true,
      message:"Reply updated successfully",
      data:review
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Fetch the Restaurant document to get the type field
    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select(
      "name type cuisine address location image logo description deliveryTime minOrder isOpen isApproved rating"
    );

    const autoOpenStatus = isRestaurantOpenNow(vendor);
    const finalStatus = vendor.isOpen && autoOpenStatus;
    const nextOpen = getNextOpeningTime(vendor);

    res.status(200).json({
      success: true,
      data: {
        basicInfo: {
          name: vendor.name,
          email: vendor.email,
          role: vendor.role
        },
        restaurantInfo: {
          restaurantName: restaurant?.name || vendor.restaurantName,
          cuisine:        restaurant?.cuisine || vendor.cuisine,
          address:        restaurant?.address || vendor.address,
          logo:           restaurant?.logo || restaurant?.image || vendor.logo,
          image:          restaurant?.image || vendor.logo,
          description:    restaurant?.description || "",
          deliveryTime:   restaurant?.deliveryTime || 30,
          minOrder:       restaurant?.minOrder || 199,
          isOpen:         vendor.isOpen,
          autoOpenStatus,
          finalStatus,
          nextOpen,
          // ✅ This is the key field for cloud kitchen detection
          type:           restaurant?.type || "Restaurant",
          isApproved:     restaurant?.isApproved || false,
          rating:         restaurant?.rating || 0,
          restaurantId:   restaurant?._id || null,
        },
        deliverySettings: vendor.deliverySettings,
        bankDetails:      vendor.bankDetails,
        operatingHours:   vendor.operatingHours,
        // Also include flat restaurant object for easy access
        restaurant: restaurant || null,
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    const { name } = req.body;

    const updatedData = {
      name,
    };

    // ✅ If image uploaded
    if (req.fileData) {
      updatedData.profilePic = req.fileData.imageUrl;
      updatedData.cloudinary_id = req.fileData.public_id;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updatedData,
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated",
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};
// UPDATE VENDOR LOGO 
const updateVendorLogo=async(req,res)=>{
  try{
    const vendor=await User.findById(req.user._id);
    if(!vendor){
      return res.status(404).json({
        message:"Vendor not found"
      });
    }
    if(!req.file){
      return res.status(400).json({
        message:"Logo image is required"
      });
    }
    vendor.logo=req.file.path;
    await vendor.save();
    res.status(200).json({
      success:true,
      message:"Logo updated successfully",
      data:{
        logo:vendor.logo
      }
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// TOGGLE RESTURANT OPEN/CLOSE
const toggleVendorStatus=async(req,res)=>{
  try{
    const vendor=await User.findById(req.user._id);
    if(!vendor){
      return res.status(404).json({
        message:"Vendor not found"
      });
    }
    vendor.isOpen=!vendor.isOpen;
    await vendor.save();
    res.status(200).json({
      success:true,
      message:`Resturant is now ${vendor.isOpen?"Open":"Closed"}`,
      data:{
        isOpen:vendor.isOpen
      }
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// UPDATE DELIVERY SETTINGS
const updateDeliverySettings=async(req,res)=>{
  try{
    const vendor=await User.findById(req.user._id);
    if(!vendor){
      return res.status(404).json({
        message:"Vendor not found"
      });
    }
    const {radius,minOrder,avgPrepTime}=req.body;
    if(!vendor.deliverySettings){
      vendor.deliverySettings={};
    }
    if(radius!==undefined) vendor.deliverySettings.radius=radius;
    if(minOrder!==undefined) vendor.deliverySettings.minOrder=minOrder;
    if(avgPrepTime!==undefined) vendor.deliverySettings.avgPrepTime=avgPrepTime;
    await vendor.save();
    res.status(200).json({
      success:true,
      message:"Delivery settings updated successfully",
      data:vendor.deliverySettings
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// UPDATE BANK DETAILS
const updateBankDetails=async(req,res)=>{
  try{
    const vendor=await User.findById(req.user._id);
    if(!vendor){
      return res.status(404).json({
        message:"Vendor not found"
      });
    }
    const {
      accountNumber,
      ifsc,
      bankName,
      accountHolderName
    }=req.body;
    if(!vendor.bankDetails){
      vendor.bankDetails={};
    }
    if(accountNumber) vendor.bankDetails.accountNumber=accountNumber;
    if(ifsc) vendor.bankDetails.ifsc=ifsc;
    if(bankName) vendor.bankDetails.bankName=bankName;
    if(accountHolderName) vendor.bankDetails.accountHolderName=accountHolderName;
    await vendor.save();
    res.status(200).json({
      success:true,
      message:"Bank details updated successfully",
      data:vendor.bankDetails
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// GET OPERATING HOURS
const getOperatingHours=async(req,res)=>{
  try{
    const vendor=await User.findById(req.user._id).select("operatingHours");
    if(!vendor){
      return res.status(404).json({
        message:"Vendor not found"
      });
    }
    res.status(200).json({
      success:true,
      data:vendor.operatingHours || {}
    });
  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};
// RESTAURANT OPEN OR CLOSE
const isRestaurantOpenNow = (vendor) => {
  const now = new Date();
  const currentDay = now
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  const todayHours = vendor.operatingHours?.[currentDay];
  if (!todayHours || !todayHours.isOpen) return false;
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};
// NEXT OPENING TIME
const getNextOpeningTime = (vendor) => {
  const days = [
    "sunday","monday","tuesday","wednesday",
    "thursday","friday","saturday"
  ];
  const now = new Date();
  const todayIndex = now.getDay();
  for (let i = 0; i < 7; i++) {
    const index = (todayIndex + i) % 7;
    const day = days[index];
    const hours = vendor.operatingHours?.[day];
    if (hours && hours.isOpen && hours.open) {
      if (i === 0) {
        const currentTime = now.toTimeString().slice(0,5);
        if (currentTime < hours.open) {
          return `Today at ${hours.open}`;
        }
      } else if (i === 1) {
        return `Tomorrow at ${hours.open}`;
      } else {
        return `${day.charAt(0).toUpperCase() + day.slice(1)} at ${hours.open}`;
      }
    }
  }
  return "Closed for now";
};
// RESTAURANT STATUS
const getRestaurantStatus = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }
    const autoOpenStatus = isRestaurantOpenNow(vendor);
    const finalStatus = vendor.isOpen && autoOpenStatus;
    const nextOpen = getNextOpeningTime(vendor);
    res.status(200).json({
      success: true,
      data: {
        isOpen: vendor.isOpen,
        autoOpenStatus,
        finalStatus,
        nextOpen
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}; 
// UPDATE FULL WEEKLY SCHEDULE
const updateFullWeeklySchedule = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }
    const { operatingHours } = req.body;
    if (!operatingHours) {
      return res.status(400).json({
        message: "Operating hours are required"
      });
    }
    const days = [
      "sunday","monday","tuesday","wednesday",
      "thursday","friday","saturday"
    ];
    for (const day of days) {
      const hours = operatingHours[day];
      if (hours) {
        if (hours.isOpen && (!hours.open || !hours.close)) {
          return res.status(400).json({
            message: `${day} must have open and close time`
          });
        }
        if (hours.open >= hours.close) {
          return res.status(400).json({
            message: `${day} opening time must be before closing time`
          });
        }
      }
    }
    vendor.operatingHours = operatingHours;
    await vendor.save();
    res.status(200).json({
      success: true,
      message: "Weekly schedule updated successfully",
      data: vendor.operatingHours
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// UPDATE SPECIFIC DAY
const updateSingleDayHours = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }
    const { day, open, close, isOpen } = req.body;
    if (!day) {
      return res.status(400).json({
        message: "Day is required"
      });
    }
    const validDays = [
      "sunday","monday","tuesday","wednesday",
      "thursday","friday","saturday"
    ];
    if (!validDays.includes(day.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid day"
      });
    }
    if (!vendor.operatingHours) {
      vendor.operatingHours = {};
    }
    vendor.operatingHours[day.toLowerCase()] = {
      open,
      close,
      isOpen
    };
    await vendor.save();
    res.status(200).json({
      success: true,
      message: `${day} schedule updated`,
      data: vendor.operatingHours[day.toLowerCase()]
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// SET HOLIDAY
const setHoliday = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }
    const { date, reason } = req.body;
    if (!date) {
      return res.status(400).json({
        message: "Date is required"
      });
    }
    if (!vendor.holidays) {
      vendor.holidays = [];
    }
    const exists = vendor.holidays.find(
      h => new Date(h.date).toDateString() === new Date(date).toDateString()
    );
    if (exists) {
      return res.status(400).json({
        message: "Holiday already exists"
      });
    }
    vendor.holidays.push({
      date,
      reason
    });
    await vendor.save();
    res.status(201).json({
      success: true,
      message: "Holiday added successfully",
      data: vendor.holidays
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// ================= CREATE NOTIFICATION HELPER =================
const createNotification = async ({
  vendorId,
  title,
  message,
  type,
  io,
}) => {
  try {
    // ✅ Always save in DB
    const notification = await Notification.create({
      vendor: vendorId,
      title,
      message,
      type,
    });

    // ✅ Get vendor settings
    const vendor = await User.findById(vendorId).select("settings");

    const allowNotifications =
      vendor?.settings?.notifications !== false;

    // 🔥 Real-time only if allowed
    if (allowNotifications && io) {
      io.to(vendorId.toString()).emit("newNotification", notification);

      // 🔴 send unread count
      const count = await Notification.countDocuments({
        vendor: vendorId,
        isRead: false,
      });

      io.to(vendorId.toString()).emit("notificationCount", count);
    }

    return notification;
  } catch (error) {
    console.error("❌ Notification error:", error.message);
  }
};


// ================= PLACE ORDER =================
const placeOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);

    const io = req.app.get("io");

    await createNotification({
      vendorId: order.vendor,
      title: "New Order 🍔",
      message: `Order #${order._id} received`,
      type: "order",
      io,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ================= GET NOTIFICATIONS =================
const getVendorNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      vendor: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ================= MARK AS READ =================
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // 🔒 security check
    if (notification.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ================= SETTINGS =================

// GET SETTINGS
const getSettings = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select("settings");

    res.status(200).json({
      success: true,
      settings: vendor?.settings || {
        darkMode: false,
        notifications: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE SETTINGS
const updateSettings = async (req, res) => {
  try {
    const { darkMode, notifications } = req.body;

    const vendor = await User.findById(req.user._id);

    if (!vendor.settings) vendor.settings = {};

    if (darkMode !== undefined) vendor.settings.darkMode = darkMode;
    if (notifications !== undefined)
      vendor.settings.notifications = notifications;

    await vendor.save();

    // 🔥 real-time sync
    const io = req.app.get("io");
    io.to(req.user._id.toString()).emit(
      "settingsUpdated",
      vendor.settings
    );

    res.status(200).json({
      success: true,
      settings: vendor.settings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// ==================== DELIVERY INTEGRATION ====================

// @desc    Notify delivery system that order is ready for pickup
// @route   PATCH /api/vendor/orders/:id/ready-for-pickup
// @access  Private (Vendor only)
const notifyDeliveryForPickup = async (req, res) => {
  try {
    const orderId = req.params.id;
    const vendorId = req.user.id;

    // Check if order belongs to this vendor
    const order = await Order.findOne({ 
      _id: orderId, 
      vendorId: vendorId 
    }).populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if order is in correct state
    if (order.status !== 'preparing') {
      return res.status(400).json({ 
        success: false, 
        message: 'Order must be in "preparing" status to mark ready for pickup' 
      });
    }

    // Update order status
    order.status = 'ready_for_pickup';
    order.readyAt = new Date();
    await order.save();

    // 🔔 Trigger event for delivery partner system
    // Option 1: If using message queue (RabbitMQ, Redis)
    await publishToQueue('order.ready.for.pickup', {
      orderId: order._id,
      vendorId: vendorId,
      restaurantAddress: order.vendorAddress,
      readyAt: order.readyAt,
      preparationTime: order.preparationTime
    });

    // Option 2: If using webhook to delivery service
    await fetch(`${process.env.DELIVERY_SERVICE_URL}/api/webhooks/order-ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order._id,
        vendorId: vendorId,
        pickupLocation: order.vendorAddress,
        orderValue: order.totalAmount,
        items: order.items.map(i => ({ name: i.name, quantity: i.quantity }))
      })
    });

    // Create notification for vendor
    await Notification.create({
      vendorId: vendorId,
      type: 'order_ready',
      title: 'Order Ready for Pickup',
      message: `Order #${order.orderNumber} is ready. Delivery partner will be notified.`,
      orderId: order._id
    });

    res.status(200).json({
      success: true,
      message: 'Order marked ready for pickup',
      data: {
        orderId: order._id,
        status: order.status,
        readyAt: order.readyAt
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get delivery status for an order
// @route   GET /api/vendor/orders/:id/delivery-status
// @access  Private (Vendor only)
const getDeliveryStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const vendorId = req.user.id;

    // Verify order belongs to vendor
    const order = await Order.findOne({ _id: orderId, vendorId: vendorId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Fetch delivery info from delivery service
    const deliveryResponse = await fetch(
      `${process.env.DELIVERY_SERVICE_URL}/api/deliveries/order/${orderId}`,
      {
        headers: { 'Authorization': `Bearer ${process.env.DELIVERY_API_KEY}` }
      }
    );

    if (!deliveryResponse.ok) {
      return res.status(200).json({
        success: true,
        data: {
          status: order.status,
          deliveryStatus: 'not_assigned',
          message: 'Delivery partner not assigned yet'
        }
      });
    }

    const deliveryData = await deliveryResponse.json();

    res.status(200).json({
      success: true,
      data: {
        orderStatus: order.status,
        delivery: {
          partnerName: deliveryData.deliveryPartner?.name,
          partnerPhone: deliveryData.deliveryPartner?.phone,
          partnerRating: deliveryData.deliveryPartner?.rating,
          status: deliveryData.status, // assigned, arrived, picked_up, delivered
          etaToRestaurant: deliveryData.etaToRestaurant,
          etaToCustomer: deliveryData.etaToCustomer,
          currentLocation: deliveryData.currentLocation,
          timeline: deliveryData.timeline
        }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Report delivery issue
// @route   POST /api/vendor/orders/:id/delivery-issue
// @access  Private (Vendor only)
const reportDeliveryIssue = async (req, res) => {
  try {
    const { issueType, description } = req.body;
    const orderId = req.params.id;
    const vendorId = req.user.id;

    const validIssues = ['late_pickup', 'wrong_driver', 'driver_unresponsive', 'other'];
    if (!validIssues.includes(issueType)) {
      return res.status(400).json({ success: false, message: 'Invalid issue type' });
    }

    // Verify order
    const order = await Order.findOne({ _id: orderId, vendorId: vendorId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Report to delivery service
    await fetch(`${process.env.DELIVERY_SERVICE_URL}/api/webhooks/delivery-issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        vendorId: vendorId,
        issueType: issueType,
        description: description,
        reportedAt: new Date()
      })
    });

    // Create support ticket
    await SupportTicket.create({
      vendorId: vendorId,
      orderId: orderId,
      type: 'delivery_issue',
      priority: 'high',
      details: { issueType, description }
    });

    res.status(200).json({
      success: true,
      message: 'Delivery issue reported successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get delivery tracking link (to share with customer)
// @route   GET /api/vendor/orders/:id/tracking-link
// @access  Private (Vendor only)
const getDeliveryTrackingLink = async (req, res) => {
  try {
    const orderId = req.params.id;
    const vendorId = req.user.id;

    const order = await Order.findOne({ _id: orderId, vendorId: vendorId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Generate tracking token
    const trackingToken = jwt.sign(
      { orderId: orderId, customerId: order.customerId },
      process.env.TRACKING_JWT_SECRET,
      { expiresIn: '7d' }
    );

    const trackingLink = `${process.env.FRONTEND_URL}/track-order/${orderId}?token=${trackingToken}`;

    res.status(200).json({
      success: true,
      data: {
        trackingLink: trackingLink,
        qrCode: await generateQRCode(trackingLink) // Optional
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// ==================== CANCEL DELIVERY ASSIGNMENT ====================

// @desc    Cancel delivery assignment for an order
// @route   POST /api/vendor/orders/:id/cancel-delivery
// @access  Private (Vendor only)
const cancelDeliveryAssignment = async (req, res) => {
  try {
    const orderId = req.params.id;
    const vendorId = req.user.id;
    const { reason, cancelType } = req.body;

    // Validate required fields
    if (!reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cancel reason is required' 
      });
    }

    // Validate cancel type
    const validCancelTypes = ['vendor_cancelled', 'delivery_issue', 'order_cancelled', 'other'];
    const finalCancelType = cancelType && validCancelTypes.includes(cancelType) 
      ? cancelType 
      : 'vendor_cancelled';

    // Verify order belongs to this vendor
    const order = await Order.findOne({ 
      _id: orderId, 
      vendorId: vendorId 
    }).populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if delivery is already assigned
    if (!order.delivery || !order.delivery.assignedAt) {
      return res.status(400).json({ 
        success: false, 
        message: 'No delivery partner assigned to this order' 
      });
    }

    // Check if delivery is already picked up or delivered
    const cannotCancelStatuses = ['picked_up', 'delivered', 'completed'];
    if (cannotCancelStatuses.includes(order.delivery.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel delivery assignment when order is ${order.delivery.status}` 
      });
    }

    // Store previous delivery info for logging
    const previousDeliveryInfo = {
      partnerId: order.delivery.partnerId,
      partnerName: order.delivery.partnerName,
      assignedAt: order.delivery.assignedAt,
      status: order.delivery.status
    };

    // Update order - remove delivery assignment
    order.delivery = {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: 'vendor',
      cancelReason: reason,
      cancelType: finalCancelType,
      previousAssignment: previousDeliveryInfo
    };

    // Reset order status back to ready_for_pickup (not preparing)
    // because order is ready but delivery cancelled
    if (order.status === 'delivery_assigned' || order.status === 'delivery_arrived') {
      order.status = 'ready_for_pickup';
    }

    await order.save();

    // 🔔 Notify delivery service about cancellation
    try {
      await fetch(`${process.env.DELIVERY_SERVICE_URL}/api/webhooks/delivery-cancelled`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DELIVERY_API_KEY}`
        },
        body: JSON.stringify({
          orderId: orderId,
          vendorId: vendorId,
          deliveryPartnerId: previousDeliveryInfo.partnerId,
          reason: reason,
          cancelType: finalCancelType,
          cancelledAt: new Date()
        })
      });
    } catch (deliveryServiceError) {
      console.error('Failed to notify delivery service:', deliveryServiceError);
      // Don't fail the request if delivery service is unreachable
      // Log error but continue
    }

    // 🔔 Send notification to delivery partner (if service supports it)
    try {
      await fetch(`${process.env.DELIVERY_SERVICE_URL}/api/delivery-partners/${previousDeliveryInfo.partnerId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'assignment_cancelled',
          orderId: orderId,
          reason: reason,
          message: `Delivery assignment for order #${order.orderNumber} has been cancelled by vendor`
        })
      });
    } catch (notifyError) {
      console.error('Failed to notify delivery partner:', notifyError);
    }

    // Create notification for vendor
    await Notification.create({
      vendorId: vendorId,
      type: 'delivery_cancelled',
      title: 'Delivery Assignment Cancelled',
      message: `Delivery for order #${order.orderNumber} has been cancelled. Reason: ${reason}`,
      orderId: order._id,
      metadata: {
        previousPartner: previousDeliveryInfo.partnerName,
        cancelReason: reason,
        cancelledAt: new Date()
      }
    });

    // Create audit log for tracking
    await AuditLog.create({
      vendorId: vendorId,
      orderId: order._id,
      action: 'delivery_assignment_cancelled',
      details: {
        previousDeliveryInfo: previousDeliveryInfo,
        cancelReason: reason,
        cancelType: finalCancelType,
        timestamp: new Date()
      }
    });

    // Emit real-time event via WebSocket
    if (global.io) {
      global.io.to(`vendor_${vendorId}`).emit('delivery_cancelled', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        cancelReason: reason,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Delivery assignment cancelled successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        newStatus: order.status,
        cancelledAt: order.delivery.cancelledAt,
        cancelReason: reason
      }
    });

  } catch (error) {
    console.error('Error in cancelDeliveryAssignment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while cancelling delivery assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
module.exports={
  getOverview,
  getLiveOrders,
  getTopItems,
  getOrderStats,
  getWeeklyRevenue,
  getVendorOrders,
  getOrderDetail,
  acceptOrder,
  rejectOrder,
  markOrderReady,
  updatePrepTime,
  getOrderHistory,
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  updateMenuPrice,
  bulkMenuAvailability,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryVisibility,
  reorderCategories,
  addIngredient,
  getIngredients,
  updateIngredient,
  deleteIngredient,
  getLowStockIngredients,
  restockIngredient,
  getEarningsSummary,
  getRevenueTrend,
  getPayoutHistory,
  getPayoutDetail,
  getTransactionBreakdown,
  getVendorReviews,
  getReviewSummary,
  replyToReview,
  editReviewReply,
  getProfile,
  updateProfile,
  updateVendorLogo,
  toggleVendorStatus,
  updateDeliverySettings,
  updateBankDetails,
  getOperatingHours,
  isRestaurantOpenNow,
  getNextOpeningTime,
  getRestaurantStatus,
  updateFullWeeklySchedule,
  updateSingleDayHours,
  setHoliday,
  createNotification,
  placeOrder,
  getVendorNotifications,
  markNotificationRead,
  getSettings,
  updateSettings,
  notifyDeliveryForPickup,
  getDeliveryStatus,
  reportDeliveryIssue,
  getDeliveryTrackingLink,
  cancelDeliveryAssignment
};