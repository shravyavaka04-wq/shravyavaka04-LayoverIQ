const express = require('express');
const router = express.Router();
const {
  getSupportedAirports,
  getAttractions,
  calculateLayover,
  generateLayoverItinerary,
  getWeather,
  calculateBudget
} = require('../controllers/layoverController');

router.get('/airports', getSupportedAirports);
router.get('/attractions', getAttractions);
router.get('/weather', getWeather);
router.post('/calculate', calculateLayover);
router.post('/generate', generateLayoverItinerary);
router.post('/budget', calculateBudget);

module.exports = router;
