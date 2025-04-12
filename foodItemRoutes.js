const express = require('express');
const {
  getFoodItems,
  getFoodStats,
  createFoodItem,
  collectFoodItem
} = require('./../controllers/foodItem.Controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getFoodItems)
  .post(protect, createFoodItem);

router.route('/stats')
  .get(getFoodStats);

router.route('/:id/collect')
  .put(protect, collectFoodItem);

module.exports = router;