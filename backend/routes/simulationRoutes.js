const express = require('express');
const router = express.Router();
const { canIVisit, whatIf, runningLate } = require('../controllers/simulationController');

router.post('/can-i-visit', canIVisit);
router.post('/what-if', whatIf);
router.post('/running-late', runningLate);

module.exports = router;
