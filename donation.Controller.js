const Donation = require('../models/Donation');
const Request = require('../models/Request');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all donations
// @route   GET /api/donations
// @access  Public
exports.getDonations = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get available donations
// @route   GET /api/donations/available
// @access  Public
exports.getAvailableDonations = asyncHandler(async (req, res, next) => {
    const donations = await Donation.find({ status: 'available' }).populate('donor', 'name email phone');
    
    res.status(200).json({
        success: true,
        count: donations.length,
        data: donations
    });
});

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Public
exports.getDonation = asyncHandler(async (req, res, next) => {
    const donation = await Donation.findById(req.params.id).populate('donor', 'name email phone');
    
    if (!donation) {
        return next(new ErrorResponse(`Donation not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
        success: true,
        data: donation
    });
});

// @desc    Create donation
// @route   POST /api/donations
// @access  Private
exports.createDonation = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.donor = req.user.id;
    
    const donation = await Donation.create(req.body);
    
    res.status(201).json({
        success: true,
        data: donation
    });
});

// @desc    Update donation
// @route   PUT /api/donations/:id
// @access  Private
exports.updateDonation = asyncHandler(async (req, res, next) => {
    let donation = await Donation.findById(req.params.id);
    
    if (!donation) {
        return next(new ErrorResponse(`Donation not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is donation owner
    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this donation`, 401));
    }
    
    donation = await Donation.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        success: true,
        data: donation
    });
});

// @desc    Delete donation
// @route   DELETE /api/donations/:id
// @access  Private
exports.deleteDonation = asyncHandler(async (req, res, next) => {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
        return next(new ErrorResponse(`Donation not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is donation owner or admin
    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this donation`, 401));
    }
    
    await donation.remove();
    
    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get my donations
// @route   GET /api/donations/my
// @access  Private
exports.getMyDonations = asyncHandler(async (req, res, next) => {
    const donations = await Donation.find({ donor: req.user.id });
    
    res.status(200).json({
        success: true,
        count: donations.length,
        data: donations
    });
});

// @desc    Request a donation
// @route   POST /api/donations/:id/request
// @access  Private
exports.requestDonation = asyncHandler(async (req, res, next) => {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
        return next(new ErrorResponse(`Donation not found with id of ${req.params.id}`, 404));
    }
    
    // Check if donation is available
    if (donation.status !== 'available') {
        return next(new ErrorResponse('This donation is not available', 400));
    }
    
    // Create request
    const request = await Request.create({
        recipient: req.user.id,
        donation: donation._id,
        foodType: donation.foodName,
        quantity: donation.quantity,
        preferredDate: donation.expiryDate,
        deliveryAddress: req.user.address,
        status: 'pending'
    });
    
    // Update donation status
    donation.status = 'reserved';
    donation.recipient = req.user.id;
    await donation.save();
    
    res.status(201).json({
        success: true,
        data: request
    });
});