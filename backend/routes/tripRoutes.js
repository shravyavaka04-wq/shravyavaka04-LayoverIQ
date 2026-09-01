const express = require('express');
const router = express.Router();
const { saveTrip, getUserTrips, getTripById, deleteTrip } = require('../controllers/tripController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, saveTrip);
router.get('/', verifyToken, getUserTrips);
router.get('/:id', verifyToken, getTripById);
router.delete('/:id', verifyToken, deleteTrip);

module.exports = router;
