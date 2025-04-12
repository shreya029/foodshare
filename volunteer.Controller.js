const Request = require('../models/Request');
const Donation = require('../models/Donation');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Volunteer = require('../models/volunteer');




exports.createVolunteer = async (req, res) => {
  try {
    // Input validation
    const requiredFields = ['fullName', 'email', 'phone', 'city', 'roles', 'availability', 'vehicle', 'motivation', 'emergencyContact'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ 
          success: false,
          error: `${field} is required` 
        });
      }
    }

    const volunteer = new Volunteer(req.body);
    await volunteer.save();
    
    res.status(201).json({ 
      success: true,
      message: 'Volunteer registered successfully!',
      data: volunteer 
    });
  } catch (error) {
    console.error('Error creating volunteer:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

exports.getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: volunteers.length,
      data: volunteers
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch volunteers'
    });
  }
};

//reward
// Add to volunteer.Controller.js
exports.addReward = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { $push: { rewards: req.body.reward } },
      { new: true }
    );
    
    if (!volunteer) {
      return res.status(404).json({ 
        success: false,
        error: 'Volunteer not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    console.error('Error adding reward:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

exports.addStars = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { $inc: { stars: req.body.stars } },
      { new: true }
    );
    
    if (!volunteer) {
      return res.status(404).json({ 
        success: false,
        error: 'Volunteer not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    console.error('Error adding stars:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};