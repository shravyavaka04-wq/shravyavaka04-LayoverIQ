const { generateItinerary } = require('./itineraryGenerator');
const { calculateRiskScore } = require('./riskScorer');
const { calculateLayoverTimes, formatDuration } = require('./layoverCalculator');
const { getAttractionById, attractions } = require('../data/attractions');
const { estimateTransit } = require('../utils/distanceCalculator');

/**
 * "What If?" Dynamic Layover Simulator
 */
const simulateWhatIf = ({
  baseParams,
  perturbations: {
    extraDurationMinutes = 0,     // e.g. +30, +60
    newTransportMode = null,       // e.g. 'taxi', 'metro'
    addAttractionId = null,        // attraction ID to add
    removeAttractionId = null,     // attraction ID to remove
    departureOffsetMinutes = 0,    // leave city X min later/earlier
    customBufferMinutes = null     // adjusted buffer
  }
}) => {
  // 1. Generate base original itinerary
  const originalItinerary = generateItinerary(baseParams);

  // Calculate base original actual physical return buffer
  const originalActivityDuration = originalItinerary.selectedAttractions.reduce((acc, a) => acc + (a.durationMin || 60), 0);
  const origAirportProcessing = originalItinerary.layoverCalculation.breakdownMinutes.totalAirportProcessingMinutes;
  const origTransitOut = originalItinerary.layoverCalculation.breakdownMinutes.travelToCityMinutes;
  const origTransitBack = originalItinerary.layoverCalculation.breakdownMinutes.travelBackToAirportMinutes;
  const origTotalLayover = originalItinerary.layoverCalculation.breakdownMinutes.totalLayoverMinutes;

  const originalActualBufferMin = Math.max(0, origTotalLayover - (origAirportProcessing + origTransitOut + originalActivityDuration + origTransitBack));

  // Consistent baseline risk score
  const originalBaselineRisk = calculateRiskScore({
    layoverCalculation: {
      ...originalItinerary.layoverCalculation,
      breakdownMinutes: {
        ...originalItinerary.layoverCalculation.breakdownMinutes,
        airportSafetyBufferMinutes: originalActualBufferMin
      }
    },
    totalAttractionDurationMin: originalActivityDuration,
    attractionCount: originalItinerary.selectedAttractions.length,
    transportMode: baseParams.preferredTransport || 'metro',
    weatherCondition: baseParams.weatherCondition || 'clear',
    hasCheckedLuggage: baseParams.hasCheckedLuggage
  });

  // 2. Prepare modified parameters
  const modifiedParams = {
    ...baseParams,
    preferredTransport: newTransportMode || baseParams.preferredTransport || 'metro',
    customBufferMinutes: customBufferMinutes !== null ? customBufferMinutes : baseParams.customBufferMinutes
  };

  const transport = modifiedParams.preferredTransport;
  const airport = originalItinerary.airport;

  // Clone timeline and selected attractions
  let simulatedAttractions = [...originalItinerary.selectedAttractions];

  // Apply remove perturbation
  if (removeAttractionId) {
    simulatedAttractions = simulatedAttractions.filter(a => a.id !== removeAttractionId);
  }

  // Apply add perturbation
  if (addAttractionId) {
    const candidateToAdd = getAttractionById(addAttractionId);
    if (candidateToAdd && !simulatedAttractions.some(a => a.id === addAttractionId)) {
      simulatedAttractions.push({
        ...candidateToAdd,
        durationMin: candidateToAdd.durationMin || 60,
        costINR: candidateToAdd.costINR || 500
      });
    }
  }

  // Calculate simulated activity duration
  let totalActivityDurationMin = simulatedAttractions.reduce((acc, a) => acc + (a.durationMin || 60), 0);
  totalActivityDurationMin += Number(extraDurationMinutes || 0);
  totalActivityDurationMin += Number(departureOffsetMinutes || 0);

  // Recalculate base layover metrics with new transport / buffer
  const layoverCalc = calculateLayoverTimes({
    airportCode: modifiedParams.airportCode,
    arrivalTime: modifiedParams.arrivalTime,
    departureTime: modifiedParams.departureTime,
    hasCheckedLuggage: modifiedParams.hasCheckedLuggage,
    isInternationalFlight: modifiedParams.isInternationalFlight,
    preferredTransport: transport,
    customBufferMinutes: modifiedParams.customBufferMinutes
  });

  // Calculate actual return time at airport after perturbations
  const transitBack = airport.transitToCity[transport] || { durationMin: 25 };
  const totalOutboundAndProcessing = layoverCalc.breakdownMinutes.totalAirportProcessingMinutes + layoverCalc.breakdownMinutes.travelToCityMinutes;
  const simulatedCityLeaveMinutes = totalOutboundAndProcessing + totalActivityDurationMin;
  const simulatedAirportArrivalMinutes = simulatedCityLeaveMinutes + transitBack.durationMin;

  const totalLayoverMinutes = layoverCalc.breakdownMinutes.totalLayoverMinutes;
  const remainingBufferAtAirportMin = Math.max(0, totalLayoverMinutes - simulatedAirportArrivalMinutes);

  // Recalculate Risk Score
  const simulatedRisk = calculateRiskScore({
    layoverCalculation: {
      ...layoverCalc,
      breakdownMinutes: {
        ...layoverCalc.breakdownMinutes,
        airportSafetyBufferMinutes: remainingBufferAtAirportMin,
        actualExplorationMinutes: layoverCalc.breakdownMinutes.actualExplorationMinutes
      }
    },
    totalAttractionDurationMin: totalActivityDurationMin,
    attractionCount: simulatedAttractions.length,
    transportMode: transport,
    weatherCondition: baseParams.weatherCondition || 'clear',
    hasCheckedLuggage: baseParams.hasCheckedLuggage
  });

  const originalScore = originalBaselineRisk.score;
  const simulatedScore = simulatedRisk.score;
  const scoreDelta = simulatedScore - originalScore;

  const isStillSafe = simulatedRisk.level !== 'HIGH RISK' && remainingBufferAtAirportMin >= 60;

  // Generate clear descriptive comparison
  const changeBullets = [];
  if (extraDurationMinutes !== 0) {
    changeBullets.push(`${extraDurationMinutes > 0 ? '+' : ''}${extraDurationMinutes} minutes spent exploring`);
  }
  if (newTransportMode && newTransportMode !== baseParams.preferredTransport) {
    changeBullets.push(`Switched transport from ${baseParams.preferredTransport} to ${newTransportMode.toUpperCase()}`);
  }
  if (addAttractionId) {
    const a = getAttractionById(addAttractionId);
    changeBullets.push(`Added attraction: ${a ? a.name : addAttractionId}`);
  }
  if (removeAttractionId) {
    const r = getAttractionById(removeAttractionId);
    changeBullets.push(`Removed attraction: ${r ? r.name : removeAttractionId}`);
  }
  if (departureOffsetMinutes !== 0) {
    changeBullets.push(`Leaving city ${Math.abs(departureOffsetMinutes)} minutes ${departureOffsetMinutes > 0 ? 'later' : 'earlier'}`);
  }

  let verdictExplanation = '';
  if (isStillSafe) {
    if (simulatedRisk.level === 'LOW RISK') {
      verdictExplanation = `🟢 Itinerary remains LOW RISK (${simulatedScore}/100). You still have a robust ${formatDuration(remainingBufferAtAirportMin)} airport buffer.`;
    } else {
      verdictExplanation = `🟡 Itinerary drops to MEDIUM RISK (${simulatedScore}/100). Remaining buffer is ${formatDuration(remainingBufferAtAirportMin)}. Manage your transit strictly.`;
    }
  } else {
    verdictExplanation = `🔴 DANGER: Itinerary becomes HIGH RISK (${simulatedScore}/100)! Airport return buffer shrinks to ${formatDuration(remainingBufferAtAirportMin)}. Flight is at high risk of being missed!`;
  }

  return {
    success: true,
    isStillSafe,
    original: {
      riskScore: originalScore,
      riskLevel: originalBaselineRisk.level,
      badgeColor: originalBaselineRisk.badgeColor,
      bufferMinutes: originalActualBufferMin,
      bufferFormatted: formatDuration(originalActualBufferMin),
      attractionsCount: originalItinerary.selectedAttractions.length
    },
    simulated: {
      riskScore: simulatedScore,
      riskLevel: simulatedRisk.level,
      badgeColor: simulatedRisk.badgeColor,
      bufferMinutes: remainingBufferAtAirportMin,
      bufferFormatted: formatDuration(remainingBufferAtAirportMin),
      attractionsCount: simulatedAttractions.length,
      simulatedRiskBreakdown: simulatedRisk
    },
    comparison: {
      scoreDelta,
      scoreDeltaFormatted: `${scoreDelta >= 0 ? '+' : ''}${scoreDelta} pts`,
      bufferDeltaMinutes: remainingBufferAtAirportMin - originalActualBufferMin,
      verdictExplanation,
      appliedChanges: changeBullets
    }
  };
};

module.exports = {
  simulateWhatIf
};
