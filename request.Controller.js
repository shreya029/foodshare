
const Request = require('../models/Request');
const Donation = require('../models/Donation');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private/Admin
exports.getRequests = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get my requests
// @route   GET /api/requests/my
// @access  Private
exports.getMyRequests = asyncHandler(async (req, res, next) => {
    const requests = await Request.find({ recipient: req.user.id }).populate('donation');
    
    res.status(200).json({
        success: true,
        count: requests.length,
        data: requests
    });
});

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
exports.getRequest = asyncHandler(async (req, res, next) => {
    const request = await Request.findById(req.params.id)
        .populate('recipient', 'name email phone')
        .populate('donation');
    
    if (!request) {
        return next(new ErrorResponse(`Request not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is request owner or admin
    if (request.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to access this request`, 401));
    }
    
    res.status(200).json({
        success: true,
        data: request
    });
});

exports.createRequest = asyncHandler(async (req, res, next) => {
    req.body.recipient = req.user.id;
    const requestData = {
        foodType: req.body.foodType,
        quantity: req.body.requestQuantity,
        preferredDate: req.body.preferredDate,
        description: req.body.requestDescription,
        deliveryAddress: req.body.deliveryAddress,
        recipient: req.user.id
  };
  const request = await Request.create(requestData);

    res.status(201).json({
        success: true,
        data: request
    });
});
  

// @desc    Update request
// @route   PUT /api/requests/:id
// @access  Private
exports.updateRequest = asyncHandler(async (req, res, next) => {
    let request = await Request.findById(req.params.id);
    
    if (!request) {
        return next(new ErrorResponse(`Request not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is request owner or admin
    if (request.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this request`, 401));
    }
    
    // If admin is approving the request
    if (req.body.status === 'approved' && req.user.role === 'admin') {
        // Update the donation status
        await Donation.findByIdAndUpdate(request.donation, {
            status: 'distributed'
        });
    }
    
    request = await Request.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        success: true,
        data: request
    });
});

// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private
exports.deleteRequest = asyncHandler(async (req, res, next) => {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
        return next(new ErrorResponse(`Request not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is request owner or admin
    if (request.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this request`, 401));
    }
    
    // If request is linked to a donation, reset the donation status
    if (request.donation) {
        await Donation.findByIdAndUpdate(request.donation, {
            status: 'available',
            recipient: null
        });
    }
    
    await request.remove();
    
    res.status(200).json({
        success: true,
        data: {}
    });
});