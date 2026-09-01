const { TripRepository } = require('../models/Trip');

/**
 * Save Itinerary Trip
 */
const saveTrip = async (req, res) => {
  try {
    const userId = req.user.id || 'guest';
    const {
      title,
      airportCode,
      airportName,
      city,
      arrivalTime,
      departureTime,
      layoverDurationMinutes,
      usableExplorationMinutes,
      riskScore,
      riskLevel,
      selectedAttractions,
      timeline,
      budgetBreakdown,
      isNewHere,
      hasCheckedLuggage
    } = req.body;

    if (!airportCode || !arrivalTime || !departureTime) {
      return res.status(400).json({ success: false, message: 'Airport code, arrival, and departure times are required.' });
    }

    const trip = await TripRepository.create({
      userId,
      title: title || `${city || airportCode} Layover Exploration`,
      airportCode,
      airportName: airportName || `${airportCode} Airport`,
      city: city || 'Transit City',
      arrivalTime: new Date(arrivalTime),
      departureTime: new Date(departureTime),
      layoverDurationMinutes: Number(layoverDurationMinutes) || 480,
      usableExplorationMinutes: Number(usableExplorationMinutes) || 215,
      riskScore: Number(riskScore) || 88,
      riskLevel: riskLevel || 'LOW RISK',
      selectedAttractions: selectedAttractions || [],
      timeline: timeline || [],
      budgetBreakdown: budgetBreakdown || {},
      isNewHere: Boolean(isNewHere),
      hasCheckedLuggage: Boolean(hasCheckedLuggage)
    });

    res.status(201).json({
      success: true,
      message: 'Trip itinerary saved successfully.',
      trip
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get User Trips
 */
const getUserTrips = async (req, res) => {
  try {
    const userId = req.user.id || 'guest';
    const trips = await TripRepository.findByUser(userId);
    res.json({
      success: true,
      count: trips.length,
      trips
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Single Trip by ID
 */
const getTripById = async (req, res) => {
  try {
    const trip = await TripRepository.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }
    res.json({ success: true, trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete Trip
 */
const deleteTrip = async (req, res) => {
  try {
    await TripRepository.deleteById(req.params.id);
    res.json({ success: true, message: 'Trip deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  saveTrip,
  getUserTrips,
  getTripById,
  deleteTrip
};
