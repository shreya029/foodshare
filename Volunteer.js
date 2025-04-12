const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  roles: { type: String, required: true },
  availability: { type: String, required: true },
  vehicle: { type: String, required: true },
  motivation: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  stars: { type: Number, default: 0 },          // Added reward system
  rewards: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
