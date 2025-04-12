const express = require('express');
const {
    getDonations,
    getAvailableDonations,
    getDonation,
    createDonation,
    updateDonation,
    deleteDonation,
    getMyDonations,
    requestDonation
} = require('../controllers/donation.Controller');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.route('/')
    .get(getDonations)
    .post(protect, createDonation);

router.route('/available').get(getAvailableDonations);
router.route('/my').get(protect, getMyDonations);
router.route('/:id/request').post(protect, requestDonation);

router.route('/:id')
    .get(getDonation)
    .put(protect, updateDonation)
    .delete(protect, deleteDonation);

module.exports = router;