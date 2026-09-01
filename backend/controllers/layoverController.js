const { calculateLayoverTimes } = require('../services/layoverCalculator');
const { generateItinerary } = require('../services/itineraryGenerator');
const { calculateBudgetEstimate } = require('../services/budgetPlanner');
const { getCityWeather } = require('../services/weatherService');
const { airports, getAirportByCode } = require('../data/airports');
const { attractions, getAttractionsByAirport } = require('../data/attractions');

/**
 * Get all supported airports
 */
const getSupportedAirports = (req, res) => {
  res.json({
    success: true,
    count: airports.length,
    airports
  });
};

/**
 * Get attractions for a specific airport
 */
const getAttractions = (req, res) => {
  const { airportCode } = req.query;
  const list = airportCode ? getAttractionsByAirport(airportCode) : attractions;
  res.json({
    success: true,
    count: list.length,
    attractions: list
  });
};

/**
 * Calculate layover breakdown
 */
const calculateLayover = (req, res) => {
  try {
    const {
      airportCode,
      arrivalTime,
      departureTime,
      hasCheckedLuggage,
      isInternationalFlight,
      preferredTransport,
      customBufferMinutes
    } = req.body;

    const result = calculateLayoverTimes({
      airportCode: airportCode || 'DXB',
      arrivalTime,
      departureTime,
      hasCheckedLuggage: Boolean(hasCheckedLuggage),
      isInternationalFlight: isInternationalFlight !== false,
      preferredTransport: preferredTransport || 'metro',
      customBufferMinutes
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Generate smart layover itinerary
 */
const generateLayoverItinerary = (req, res) => {
  try {
    const {
      airportCode,
      arrivalTime,
      departureTime,
      budget,
      interests,
      preferredTransport,
      travelers,
      hasCheckedLuggage,
      isInternationalFlight,
      isNewHere,
      weatherCondition,
      customBufferMinutes
    } = req.body;

    const itinerary = generateItinerary({
      airportCode: airportCode || 'DXB',
      arrivalTime,
      departureTime,
      budget: Number(budget) || 3000,
      interests: Array.isArray(interests) && interests.length > 0 ? interests : ['landmarks', 'food', 'photography'],
      preferredTransport: preferredTransport || 'metro',
      travelers: Number(travelers) || 1,
      hasCheckedLuggage: Boolean(hasCheckedLuggage),
      isInternationalFlight: isInternationalFlight !== false,
      isNewHere: Boolean(isNewHere),
      weatherCondition: weatherCondition || 'clear',
      customBufferMinutes
    });

    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Weather & Climate endpoint
 */
const getWeather = (req, res) => {
  const { airportCode } = req.query;
  const weather = getCityWeather(airportCode || 'DXB');
  res.json({ success: true, weather });
};

/**
 * Budget Planner endpoint
 */
const calculateBudget = (req, res) => {
  try {
    const result = calculateBudgetEstimate(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSupportedAirports,
  getAttractions,
  calculateLayover,
  generateLayoverItinerary,
  getWeather,
  calculateBudget
};
