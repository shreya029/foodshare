const express = require('express');
const {
    getRequests,
    getRequest,
    getMyRequests,
    createRequest,
    updateRequest,
    deleteRequest
} = require('../controllers/request.Controller');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.route('/')
    .get(protect, getRequests);

    router.route('/create')
  .post(protect, createRequest);


router.route('/my').get(protect, getMyRequests);

router.route('/:id')
    .get(protect, getRequest)
    .put(protect, updateRequest)
    .delete(protect, deleteRequest);

module.exports = router;