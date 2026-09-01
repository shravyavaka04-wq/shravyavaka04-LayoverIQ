const { evaluateCanIVisit } = require('../services/canIVisitEngine');
const { simulateWhatIf } = require('../services/whatIfSimulator');
const { optimizeEmergencyDelay } = require('../services/emergencyOptimizer');

/**
 * "Can I Actually Visit This?" Feasibility check endpoint
 */
const canIVisit = (req, res) => {
  try {
    const {
      airportCode,
      attractionId,
      customAttraction,
      arrivalTime,
      departureTime,
      transportMode,
      hasCheckedLuggage,
      isInternationalFlight
    } = req.body;

    const evaluation = evaluateCanIVisit({
      airportCode: airportCode || 'DXB',
      attractionId,
      customAttraction,
      arrivalTime,
      departureTime,
      transportMode: transportMode || 'metro',
      hasCheckedLuggage: Boolean(hasCheckedLuggage),
      isInternationalFlight: isInternationalFlight !== false
    });

    res.json({ success: true, ...evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * "What If?" Dynamic Simulation endpoint
 */
const whatIf = (req, res) => {
  try {
    const { baseParams, perturbations } = req.body;

    if (!baseParams) {
      return res.status(400).json({ success: false, message: 'Base parameters required for simulation.' });
    }

    const simulation = simulateWhatIf({
      baseParams,
      perturbations: perturbations || {}
    });

    res.json(simulation);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * "🚨 I'M RUNNING LATE" Emergency Protocol endpoint
 */
const runningLate = (req, res) => {
  try {
    const {
      delayMinutes,
      airportCode,
      arrivalTime,
      departureTime,
      hasCheckedLuggage,
      isInternationalFlight,
      currentStopIndex,
      currentLocationName,
      currentCoordinates
    } = req.body;

    const emergency = optimizeEmergencyDelay({
      delayMinutes: Number(delayMinutes) || 30,
      airportCode: airportCode || 'DXB',
      arrivalTime,
      departureTime,
      hasCheckedLuggage: Boolean(hasCheckedLuggage),
      isInternationalFlight: isInternationalFlight !== false,
      currentStopIndex: Number(currentStopIndex) || 1,
      currentLocationName: currentLocationName || 'Downtown City Center',
      currentCoordinates
    });

    res.json(emergency);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  canIVisit,
  whatIf,
  runningLate
};
