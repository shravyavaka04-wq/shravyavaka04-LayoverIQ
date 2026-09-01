const { getAirportByCode } = require('../data/airports');
const { getAttractionsByAirport, attractions } = require('../data/attractions');
const { calculateLayoverTimes, formatDuration } = require('./layoverCalculator');
const { calculateRiskScore } = require('./riskScorer');
const { estimateTransit, calculateDistanceKm } = require('../utils/distanceCalculator');

/**
 * Format a Date object into "h:mm A" (e.g. "10:30 AM")
 */
const formatTimeOnly = (dateObj) => {
  if (!dateObj) return '';
  return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Smart Itinerary Generation Engine
 */
const generateItinerary = ({
  airportCode = 'DXB',
  arrivalTime,
  departureTime,
  budget = 3000,
  interests = ['landmarks', 'food', 'photography'],
  preferredTransport = 'metro',
  travelers = 1,
  hasCheckedLuggage = false,
  isInternationalFlight = true,
  isNewHere = false,
  weatherCondition = 'clear',
  customBufferMinutes = null
}) => {
  // 1. Calculate fundamental layover metrics
  const layoverCalc = calculateLayoverTimes({
    airportCode,
    arrivalTime,
    departureTime,
    hasCheckedLuggage,
    isInternationalFlight,
    preferredTransport,
    customBufferMinutes
  });

  const airport = layoverCalc.airport;
  const availableExplorationMin = layoverCalc.breakdownMinutes.actualExplorationMinutes;

  const arrivalDate = new Date(layoverCalc.timestamps.arrivalTime);
  const departureDate = new Date(layoverCalc.timestamps.departureTime);

  // If exploration is not viable (< 60 min), generate terminal-based safety itinerary
  if (!layoverCalc.isViableForCityExploration) {
    const timeline = [
      {
        id: 'step_arrival',
        type: 'flight_arrival',
        time: formatTimeOnly(arrivalDate),
        title: `Flight Arrival at ${airport.code}`,
        description: `Land at ${airport.name}. Proceed to transit area or terminal lounge.`,
        durationMin: 0,
        costINR: 0,
        badge: 'Arrival'
      },
      {
        id: 'step_terminal_lounge',
        type: 'terminal_activity',
        time: formatTimeOnly(new Date(arrivalDate.getTime() + 30 * 60 * 1000)),
        title: 'Airport Transit Lounge & Relaxation',
        description: `Due to your short layover (${layoverCalc.formatted.totalLayover}), leaving the airport is unsafe. Relax at the transit concourse, duty free shops, and airport cafes.`,
        durationMin: Math.max(30, layoverCalc.breakdownMinutes.totalLayoverMinutes - 90),
        costINR: 500,
        badge: 'Recommended Safe Stay'
      },
      {
        id: 'step_gate',
        type: 'gate_boarding',
        time: formatTimeOnly(new Date(departureDate.getTime() - 45 * 60 * 1000)),
        title: 'Boarding Gate Arrival',
        description: `Arrive at your departure gate at ${airport.code} for boarding.`,
        durationMin: 45,
        costINR: 0,
        badge: 'Boarding'
      },
      {
        id: 'step_departure',
        type: 'flight_departure',
        time: formatTimeOnly(departureDate),
        title: `Connecting Flight Departure`,
        description: `Depart to next destination from ${airport.name}.`,
        durationMin: 0,
        costINR: 0,
        badge: 'Departure'
      }
    ];

    const risk = calculateRiskScore({
      layoverCalculation: layoverCalc,
      totalAttractionDurationMin: 0,
      attractionCount: 0,
      transportMode: preferredTransport,
      weatherCondition,
      hasCheckedLuggage
    });

    return {
      success: true,
      layoverCalculation: layoverCalc,
      isTerminalOnly: true,
      timeline,
      selectedAttractions: [],
      budgetBreakdown: {
        transport: 0,
        food: 500 * travelers,
        attractions: 0,
        emergencyReserve: 500,
        total: (500 * travelers) + 500,
        userBudget: budget,
        fitsBudget: budget >= ((500 * travelers) + 500)
      },
      riskScore: risk,
      weatherNotice: null,
      notes: [
        'Layover duration is below safe threshold for city exploration.',
        'Enjoy airport amenities and avoid missing your connecting flight.'
      ]
    };
  }

  // 2. Fetch candidates & prioritize
  let candidates = getAttractionsByAirport(airportCode);
  if (candidates.length === 0) {
    // Generic fallback attractions if specific airport not in local list
    candidates = attractions.slice(0, 4);
  }

  const interestSet = new Set((interests || []).map(i => i.toLowerCase()));
  const isRaining = weatherCondition.toLowerCase().includes('rain') || weatherCondition.toLowerCase().includes('storm');

  // Score candidate attractions
  const scoredCandidates = candidates.map(attr => {
    let score = attr.popularity || 80;

    // Interest bonus (+25 per category match)
    const matchCount = attr.categories.filter(c => interestSet.has(c.toLowerCase())).length;
    score += matchCount * 30;

    // Weather bonus/penalty
    if (isRaining) {
      if (attr.isIndoor) {
        score += 40;
      } else {
        score -= 50;
      }
    }

    // Distance to airport penalty
    const distToAirport = calculateDistanceKm(airport.coordinates, attr.coordinates);
    score -= distToAirport * 1.5;

    // Priority bonus
    if (attr.priority === 'high') score += 15;

    // Beginner mode preference for famous iconic landmarks
    if (isNewHere && (attr.categories.includes('landmarks') || attr.categories.includes('culture'))) {
      score += 25;
    }

    return {
      ...attr,
      matchCount,
      score,
      distToAirport
    };
  });

  // Sort descending by calculated score
  scoredCandidates.sort((a, b) => b.score - a.score);

  // 3. Selection & Timeline Scheduling
  const selectedAttractions = [];
  let remainingBudget = budget;
  let accumulatedActivityDuration = 0;
  // Reserve a 30-minute safety cushion in exploration time
  const targetAvailableMin = Math.max(45, availableExplorationMin - 25);

  let currentCoord = airport.coordinates;
  const interStopTransits = [];

  for (const candidate of scoredCandidates) {
    // Check if adding this candidate fits into remaining exploration time
    const transitEstimate = estimateTransit(currentCoord, candidate.coordinates, preferredTransport);
    const neededTime = candidate.durationMin + transitEstimate.durationMin;

    if (accumulatedActivityDuration + neededTime <= targetAvailableMin) {
      // Check budget
      const ticketCostTotal = candidate.costINR * travelers;
      if (selectedAttractions.length === 0 || remainingBudget >= ticketCostTotal) {
        selectedAttractions.push({
          ...candidate,
          transitFromPrevious: transitEstimate,
          whySelected: `Selected because it is ${candidate.distToAirport.toFixed(1)} km from ${airport.code}, matches your interest in ${candidate.categories.join(', ')}, and fits comfortably within your ${formatDuration(availableExplorationMin)} exploration window.`
        });

        accumulatedActivityDuration += neededTime;
        remainingBudget -= ticketCostTotal;
        currentCoord = candidate.coordinates;
      }
    }

    // Max 3 attractions for a safe layover itinerary to prevent rushed schedule
    if (selectedAttractions.length >= 3) break;
  }

  // If no attraction fit (very tight), at least pick 1 closest high-scoring attraction
  if (selectedAttractions.length === 0 && scoredCandidates.length > 0) {
    const closest = [...scoredCandidates].sort((a, b) => a.distToAirport - b.distToAirport)[0];
    const transit = estimateTransit(airport.coordinates, closest.coordinates, preferredTransport);
    selectedAttractions.push({
      ...closest,
      durationMin: closest.minViableDurationMin || 40,
      transitFromPrevious: transit,
      whySelected: `Closest iconic attraction (${closest.distToAirport.toFixed(1)} km from airport), allowing an express visit while maintaining your return buffer.`
    });
    accumulatedActivityDuration += (closest.minViableDurationMin || 40) + transit.durationMin;
  }

  // 4. Construct minute-by-minute timeline
  const timeline = [];
  let currentTime = new Date(arrivalDate.getTime());

  // Step 1: Airport Arrival
  timeline.push({
    id: 'step_landing',
    type: 'flight_arrival',
    time: formatTimeOnly(currentTime),
    title: `Arrive at ${airport.name} (${airport.code})`,
    description: `Landing time. Prepare travel documents and disembark.`,
    durationMin: 0,
    costINR: 0,
    badge: 'Flight Arrival',
    icon: 'plane-landing'
  });

  // Step 2: Immigration & Airport Exit
  const immigrationDuration = layoverCalc.breakdownMinutes.totalAirportProcessingMinutes;
  currentTime = new Date(currentTime.getTime() + immigrationDuration * 60 * 1000);
  timeline.push({
    id: 'step_immigration',
    type: 'airport_processing',
    time: formatTimeOnly(new Date(currentTime.getTime() - immigrationDuration * 60 * 1000)),
    endTime: formatTimeOnly(currentTime),
    title: 'Immigration, Customs & Airport Exit',
    description: hasCheckedLuggage
      ? `Clear immigration, collect checked luggage, store at left-luggage facility (${airport.luggageStorage.locations}), and exit terminal.`
      : `Clear passport control & customs, and exit terminal via rapid exit.`,
    durationMin: immigrationDuration,
    costINR: hasCheckedLuggage ? (airport.luggageStorage.costPerItemPerHourLocal * 25 * 3) : 0,
    badge: 'Airport Processing',
    icon: 'passport'
  });

  // Step 3: Transit to first attraction
  const firstAttr = selectedAttractions[0];
  const firstTransit = estimateTransit(airport.coordinates, firstAttr.coordinates, preferredTransport);
  const transitStartTime = new Date(currentTime.getTime());
  currentTime = new Date(currentTime.getTime() + firstTransit.durationMin * 60 * 1000);

  timeline.push({
    id: 'step_transit_to_city',
    type: 'transit',
    time: formatTimeOnly(transitStartTime),
    endTime: formatTimeOnly(currentTime),
    title: `Transit to City: ${firstAttr.name}`,
    description: `Take ${firstTransit.mode.toUpperCase()} (${firstTransit.distanceKm} km). Estimated travel time: ${firstTransit.durationMin} mins.`,
    durationMin: firstTransit.durationMin,
    costINR: firstTransit.costINR * travelers,
    badge: `Transit (${firstTransit.mode})`,
    icon: 'car'
  });

  // Steps for Attractions
  selectedAttractions.forEach((attr, idx) => {
    const attrStartTime = new Date(currentTime.getTime());
    currentTime = new Date(currentTime.getTime() + attr.durationMin * 60 * 1000);

    timeline.push({
      id: `step_attr_${attr.id}`,
      type: 'attraction',
      time: formatTimeOnly(attrStartTime),
      endTime: formatTimeOnly(currentTime),
      title: attr.name,
      description: attr.description,
      durationMin: attr.durationMin,
      costINR: attr.costINR * travelers,
      costLocal: attr.costLocal,
      categories: attr.categories,
      isIndoor: attr.isIndoor,
      coordinates: attr.coordinates,
      whySelected: attr.whySelected,
      layoverPitch: attr.layoverPitch,
      badge: `Stop #${idx + 1}`,
      icon: 'map-pin'
    });

    // If there is a next attraction, add inter-attraction transit
    if (idx < selectedAttractions.length - 1) {
      const nextAttr = selectedAttractions[idx + 1];
      const interTransit = estimateTransit(attr.coordinates, nextAttr.coordinates, preferredTransport);
      const interStartTime = new Date(currentTime.getTime());
      currentTime = new Date(currentTime.getTime() + interTransit.durationMin * 60 * 1000);

      timeline.push({
        id: `step_transit_${idx}`,
        type: 'transit',
        time: formatTimeOnly(interStartTime),
        endTime: formatTimeOnly(currentTime),
        title: `Travel: ${attr.name} → ${nextAttr.name}`,
        description: `Transfer via ${interTransit.mode.toUpperCase()} (${interTransit.distanceKm} km, ~${interTransit.durationMin} mins).`,
        durationMin: interTransit.durationMin,
        costINR: interTransit.costINR * travelers,
        badge: 'Transit',
        icon: 'arrow-right'
      });
    }
  });

  // Step: Return Transit to Airport
  const lastAttr = selectedAttractions[selectedAttractions.length - 1];
  const returnTransit = estimateTransit(lastAttr.coordinates, airport.coordinates, preferredTransport);
  const returnStartTime = new Date(currentTime.getTime());
  currentTime = new Date(currentTime.getTime() + returnTransit.durationMin * 60 * 1000);

  timeline.push({
    id: 'step_transit_back',
    type: 'transit',
    time: formatTimeOnly(returnStartTime),
    endTime: formatTimeOnly(currentTime),
    title: `Return to ${airport.code} Airport`,
    description: `Head back to airport via ${returnTransit.mode.toUpperCase()} (${returnTransit.distanceKm} km). MUST depart city by ${formatTimeOnly(returnStartTime)}!`,
    durationMin: returnTransit.durationMin,
    costINR: returnTransit.costINR * travelers,
    badge: 'Airport Return Transit',
    icon: 'plane-takeoff',
    criticalDeadline: true
  });

  // Step: Airport Safety Buffer / Security & Boarding Check-in
  const bufferDuration = layoverCalc.breakdownMinutes.airportSafetyBufferMinutes;
  const airportArrivalTime = new Date(currentTime.getTime());

  timeline.push({
    id: 'step_airport_buffer',
    type: 'airport_buffer',
    time: formatTimeOnly(airportArrivalTime),
    endTime: formatTimeOnly(departureDate),
    title: `Airport Re-entry, Security & Departure Buffer`,
    description: hasCheckedLuggage
      ? `Retrieve luggage from storage, check-in, pass terminal security/customs, and proceed to boarding gate.`
      : `Pass airport security screening and proceed to departure gate with safety buffer.`,
    durationMin: bufferDuration,
    costINR: 0,
    badge: `${formatDuration(bufferDuration)} Safety Buffer`,
    icon: 'shield-check'
  });

  // Final Step: Flight Departure
  timeline.push({
    id: 'step_departure',
    type: 'flight_departure',
    time: formatTimeOnly(departureDate),
    title: `Connecting Flight Departure (${airport.code})`,
    description: `Flight departs on schedule from ${airport.name}.`,
    durationMin: 0,
    costINR: 0,
    badge: 'Takeoff',
    icon: 'send'
  });

  // 5. Budget Calculation
  let totalTransportINR = (firstTransit.costINR + returnTransit.costINR) * travelers;
  let totalTicketsINR = selectedAttractions.reduce((acc, a) => acc + (a.costINR * travelers), 0);
  let totalFoodINR = 600 * travelers; // average meals/snack
  let emergencyReserveINR = Math.max(400, Math.round(budget * 0.15));

  let totalTripCostINR = totalTransportINR + totalTicketsINR + totalFoodINR + emergencyReserveINR;

  const budgetBreakdown = {
    transport: totalTransportINR,
    food: totalFoodINR,
    attractions: totalTicketsINR,
    emergencyReserve: emergencyReserveINR,
    total: totalTripCostINR,
    userBudget: budget,
    fitsBudget: budget >= totalTripCostINR,
    currencySymbol: '₹',
    currencyCode: 'INR'
  };

  // 6. Risk Score Calculation
  const risk = calculateRiskScore({
    layoverCalculation: layoverCalc,
    totalAttractionDurationMin: accumulatedActivityDuration,
    attractionCount: selectedAttractions.length,
    transportMode: preferredTransport,
    weatherCondition,
    hasCheckedLuggage
  });

  let weatherNotice = null;
  if (isRaining) {
    weatherNotice = {
      type: 'rain',
      badge: '🌧️ Weather-aware recommendation',
      message: `Rain or showers detected in ${airport.city}. We prioritized indoor cultural spaces, malls, and museums to keep your layover comfortable and dry.`
    };
  }

  return {
    success: true,
    airport,
    layoverCalculation: layoverCalc,
    isTerminalOnly: false,
    timeline,
    selectedAttractions,
    budgetBreakdown,
    riskScore: risk,
    weatherNotice,
    whySelectedSummary: `We selected ${selectedAttractions.length} top attractions based on your interests (${interests.join(', ')}), proximity to ${airport.code}, and guaranteed ${formatDuration(bufferDuration)} airport buffer.`,
    emergencyReturnSummary: {
      latestCityDeparture: formatTimeOnly(returnStartTime),
      airportArrivalTime: formatTimeOnly(airportArrivalTime),
      departureTime: formatTimeOnly(departureDate),
      fastestMode: 'Taxi / Cab (20 mins)'
    }
  };
};

module.exports = {
  generateItinerary,
  formatTimeOnly
};
