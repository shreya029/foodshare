const FoodItem = require('../models/FoodItem');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create food item from donation
// @route   POST /api/food-items
// @access  Private
exports.createFoodItem = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.donor = req.user.id;

  // Validate required fields
  const requiredFields = ['name', 'quantity', 'unit', 'expiryDate', 'collectionTime', 'location'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return next(new ErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400));
  }

  // Create food item
  const foodItem = await FoodItem.create(req.body);

  res.status(201).json({
    success: true,
    data: foodItem
  });
});

// @desc    Get all food items
// @route   GET /api/food-items
// @access  Public
exports.getFoodItems = asyncHandler(async (req, res, next) => {
  const { status, category } = req.query;
  let query = {};

  if (status) query.status = status;
  if (category) query.category = category;

  const foodItems = await FoodItem.find(query)
    .populate('donor', 'name email')
    .sort({ expiryDate: 1 });

  res.status(200).json({
    success: true,
    count: foodItems.length,
    data: foodItems
  });
});

// @desc    Get food statistics
// @route   GET /api/food-items/stats
// @access  Public
exports.getFoodStats = asyncHandler(async (req, res, next) => {
  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 7); // 7 days from now

  const stats = await Promise.all([
    FoodItem.countDocuments(),
    FoodItem.countDocuments({ status: 'available', expiryDate: { $gte: now } }),
    FoodItem.countDocuments({ 
      status: 'available',
      expiryDate: { $gte: now, $lte: soon }
    }),
    FoodItem.countDocuments({ status: 'collected' }),
    FoodItem.countDocuments({ status: 'expired' }),
    FoodItem.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    FoodItem.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalItems: stats[0],
      availableItems: stats[1],
      expiringSoon: stats[2],
      collectedItems: stats[3],
      expiredItems: stats[4],
      byStatus: stats[5],
      byCategory: stats[6]
    }
  });
});

// @desc    Update food item status to collected
// @route   PUT /api/food-items/:id/collect
// @access  Private
exports.collectFoodItem = asyncHandler(async (req, res, next) => {
  const foodItem = await FoodItem.findById(req.params.id);
  
  if (!foodItem) {
    return next(new ErrorResponse(`Food item not found with id of ${req.params.id}`, 404));
  }
  
  // Check if food item is already collected
  if (foodItem.status === 'collected') {
    return next(new ErrorResponse('Food item already collected', 400));
  }

  // Update status to collected
  foodItem.status = 'collected';
  foodItem.collectedAt = new Date();
  await foodItem.save();
  
  res.status(200).json({
    success: true,
    data: foodItem
    
  });
});