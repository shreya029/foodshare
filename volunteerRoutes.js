const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteer.Controller');

router.post('/', volunteerController.createVolunteer);
router.get('/', volunteerController.getAllVolunteers);

router.post('/:id/reward', volunteerController.addReward);
router.post('/:id/stars', volunteerController.addStars);

module.exports = router;
