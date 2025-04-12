const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    foodName: {
        type: String,
        required: [true, 'Please add a food name']
    },
    quantity: {
        type: String,
        required: [true, 'Please add quantity']
    },
    expiryDate: {
        type: Date,
        required: [true, 'Please add expiry date']
    },
    description: {
        type: String
    },
    pickupAddress: {
        type: String,
        required: [true, 'Please add pickup address']
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'distributed'],
        default: 'available'
    },
    donor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Donation', DonationSchema);