const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    foodType: {
        type: String,
        required: [true, 'Please add food type']
    },
    quantity: {
        type: String,
        required: [true, 'Please add quantity']
    },
    preferredDate: {
        type: Date,
        required: [true, 'Please add preferred date']
    },
    description: {
        type: String
    },
    deliveryAddress: {
        type: String,
        required: [true, 'Please add delivery address']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'fulfilled'],
        default: 'pending'
    },
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    donation: {
        type: mongoose.Schema.ObjectId,
        ref: 'Donation'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Request', RequestSchema);