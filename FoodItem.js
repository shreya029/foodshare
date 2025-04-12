const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a food name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: [
            'Perishable',
            'Non-Perishable',
            'Dairy',
            'Meat',
            'Produce',
            'Bakery',
            'Other'
        ]
    },
    quantity: {
        type: Number,
        required: [true, 'Please add quantity'],
        min: [0, 'Quantity must be at least 0']
    },
    unit: {
        type: String,
        required: [true, 'Please add unit'],
        enum: ['kg', 'g', 'lb', 'oz', 'l', 'ml', 'units']
    },
    expiryDate: {
        type: Date,
        required: [true, 'Please add expiry date']
    },
    collectionTime: {
        type: Date,
        required: [true, 'Please add collection time']
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'collected', 'expired', 'donated'],
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
    notes: {
        type: String
    },
    location: {
        type: String,
        required: [true, 'Please add location']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Cascade delete requests when a food item is deleted
FoodItemSchema.pre('remove', async function(next) {
    await this.model('Request').deleteMany({ foodItem: this._id });
    next();
});

module.exports = mongoose.model('FoodItem', FoodItemSchema);