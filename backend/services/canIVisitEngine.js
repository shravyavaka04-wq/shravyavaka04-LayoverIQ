const { getAirportByCode } = require('../data/airports');
const { getAttractionById, attractions } = require('../data/attractions');
const { calculateLayoverTimes, formatDuration, parseDateTime } = require('./layoverCalculator');
const { estimateTransit, calculateDistanceKm } = require('../utils/distanceCalculator');

/**
 * "Can I Actually Visit This?" Feasibility Engine
 */
const evaluateCanIVisit = ({
  airportCode = 'DXB',
  attractionId,
  customAttraction = null,
  arrivalTime,
  departureTime,
  transportMode = 'metro',
  hasCheckedLuggage = false,
  isInternationalFlight = true
}) => {
  const airport = getAirportByCode(airportCode) || {
    code: airportCode || 'DXB',
    name: 'Airport',
    coordinates: { lat: 25.2532, lng: 55.3657 },
    processingTimes: { averageImmigrationMin: 45, airportExitMin: 15, baggageClaimMin: 30, leftLuggageServiceMin: 15 },
    safetyBuffers: { internationalReturnBufferMin: 120, domesticReturnBufferMin: 90 },
    transitToCity: { metro: { durationMin: 25 }, taxi: { durationMin: 20 } }
  };

  // Find attraction by ID or use custom provided data
  let targetAttraction = getAttractionById(attractionId);
  if (!targetAttraction && customAttraction) {
    targetAttraction = {
      id: 'custom_attr',
      name: customAttraction.name || 'Custom Attraction',
      coordinates: customAttraction.coordinates || { lat: airport.coordinates.lat + 0.05, lng: airport.coordinates.lng + 0.05 },
      durationMin: Number(customAttraction.durationMin) || 60,
      costINR: Number(customAttraction.costINR) || 1000,
      isIndoor: Boolean(customAttraction.isIndoor),
      categories: customAttraction.categories || ['landmarks']
    };
  }

  if (!targetAttraction) {
    // Default to the first available attraction for this airport
    const candidates = attractions.filter(a => a.airportCode.toUpperCase() === airport.code.toUpperCase());
    targetAttraction = candidates[0] || attractions[0];
  }

  const arrival = parseDateTime(arrivalTime) || new Date();
  let departure = parseDateTime(departureTime);
  if (!departure || departure <= arrival) {
    departure = new Date(arrival.getTime() + 8 * 60 * 60 * 1000);
  }

  // 1. Calculate airport exit processing
  const airportProcessingMin = isInternationalFlight
    ? (airport.processingTimes.averageImmigrationMin || 45) + (airport.processingTimes.airportExitMin || 15)
    : 25 + (airport.processingTimes.airportExitMin || 15);

  const luggageMin = hasCheckedLuggage ? 40 : 0;
  const totalAirportExitMin = airportProcessingMin + luggageMin;

  // 2. Calculate transit to attraction
  const outboundTransit = estimateTransit(airport.coordinates, targetAttraction.coordinates, transportMode);
  const travelFromAirportMin = outboundTransit.durationMin;

  // 3. Recommended visit duration
  const recommendedVisitDurationMin = targetAttraction.durationMin || 60;

  // 4. Return journey to airport
  const inboundTransit = estimateTransit(targetAttraction.coordinates, airport.coordinates, transportMode);
  const returnJourneyMin = inboundTransit.durationMin;

  // 5. Airport Safety Buffer
  const airportSafetyBufferMin = isInternationalFlight
    ? (airport.safetyBuffers.internationalReturnBufferMin || 120)
    : (airport.safetyBuffers.domesticReturnBufferMin || 90);

  // Total required minutes from touchdown to departure
  const totalRequiredMinutes = (
    totalAirportExitMin +
    travelFromAirportMin +
    recommendedVisitDurationMin +
    returnJourneyMin +
    airportSafetyBufferMin
  );

  const totalAvailableLayoverMinutes = Math.round((departure.getTime() - arrival.getTime()) / (1000 * 60));
  const surplusMinutes = totalAvailableLayoverMinutes - totalRequiredMinutes;

  // 6. Timestamps
  const cityArrivalTime = new Date(arrival.getTime() + (totalAirportExitMin + travelFromAirportMin) * 60 * 1000);
  const attractionLeaveTime = new Date(cityArrivalTime.getTime() + recommendedVisitDurationMin * 60 * 1000);
  const estimatedAirportReturnTime = new Date(attractionLeaveTime.getTime() + returnJourneyMin * 60 * 1000);
  const actualBufferBeforeFlightMin = Math.round((departure.getTime() - estimatedAirportReturnTime.getTime()) / (1000 * 60));

  // 7. Decision Logic
  let status = 'SAFE';
  let badgeColor = 'green';
  let icon = 'check-circle';
  let verdictTitle = '🟢 SAFE TO VISIT';
  let advice = '';

  if (surplusMinutes >= 40 && actualBufferBeforeFlightMin >= airportSafetyBufferMin) {
    status = 'SAFE';
    badgeColor = 'green';
    icon = 'check-circle';
    verdictTitle = '🟢 SAFE';
    advice = `You have ample time to visit ${targetAttraction.name} with a comfortable ${formatDuration(actualBufferBeforeFlightMin)} buffer before your flight departure.`;
  } else if (surplusMinutes >= 0 || actualBufferBeforeFlightMin >= 90) {
    status = 'RISKY';
    badgeColor = 'yellow';
    icon = 'alert-triangle';
    verdictTitle = '🟡 RISKY';
    advice = `Visiting is technically possible, but delays in transit or security could make you late for boarding. Keep your visit strictly under ${formatDuration(targetAttraction.minViableDurationMin || 35)} and use rapid taxi transit.`;
  } else {
    status = 'NOT_RECOMMENDED';
    badgeColor = 'red';
    icon = 'x-circle';
    verdictTitle = '🔴 NOT RECOMMENDED';
    advice = `Insufficient layover time to safely visit ${targetAttraction.name}. You would risk missing your flight due to inadequate return buffers. We recommend airport transit activities instead.`;
  }

  return {
    attraction: targetAttraction,
    status,
    verdictTitle,
    badgeColor,
    icon,
    advice,
    calculation: {
      travelFromAirportMin,
      travelFromAirportFormatted: formatDuration(travelFromAirportMin),
      recommendedVisitDurationMin,
      recommendedVisitDurationFormatted: formatDuration(recommendedVisitDurationMin),
      returnJourneyMin,
      returnJourneyFormatted: formatDuration(returnJourneyMin),
      airportSafetyBufferMin,
      airportSafetyBufferFormatted: formatDuration(airportSafetyBufferMin),
      totalRequiredMinutes,
      totalRequiredFormatted: formatDuration(totalRequiredMinutes),
      totalAvailableLayoverMinutes,
      totalAvailableFormatted: formatDuration(totalAvailableLayoverMinutes),
      surplusMinutes,
      actualBufferBeforeFlightMin,
      actualBufferFormatted: formatDuration(Math.max(0, actualBufferBeforeFlightMin))
    },
    timelinePreview: {
      flightLanding: arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      arriveAtAttraction: cityArrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      leaveAttraction: attractionLeaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedAirportReturn: estimatedAirportReturnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      flightDeparture: departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    transportUsed: {
      mode: transportMode,
      outboundTransit,
      inboundTransit
    }
  };
};

module.exports = {
  evaluateCanIVisit
};
