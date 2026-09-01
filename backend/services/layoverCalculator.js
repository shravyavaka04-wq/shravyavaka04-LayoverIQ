const { getAirportByCode } = require('../data/airports');

/**
 * Format minutes into readable "X hours Y minutes"
 */
const formatDuration = (totalMinutes) => {
  if (totalMinutes <= 0) return '0 minutes';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (hours === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
};

/**
 * Helper to parse date/time into timestamp
 */
const parseDateTime = (timeInput) => {
  if (!timeInput) return null;
  const parsed = new Date(timeInput);
  if (isNaN(parsed.getTime())) {
    // If given as HH:MM format today
    if (typeof timeInput === 'string' && timeInput.includes(':')) {
      const [h, m] = timeInput.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }
    return null;
  }
  return parsed;
};

/**
 * Core Smart Layover Calculator
 */
const calculateLayoverTimes = ({
  airportCode,
  arrivalTime,
  departureTime,
  hasCheckedLuggage = false,
  isInternationalFlight = true,
  preferredTransport = 'metro',
  customBufferMinutes = null
}) => {
  const airport = getAirportByCode(airportCode) || {
    code: airportCode || 'GEN',
    name: 'International Airport',
    city: 'Transit City',
    processingTimes: {
      immigrationCustomsMin: 45,
      airportExitMin: 15,
      baggageClaimMin: 30,
      leftLuggageServiceMin: 15
    },
    safetyBuffers: {
      internationalReturnBufferMin: 120,
      domesticReturnBufferMin: 90
    },
    transitToCity: {
      metro: { durationMin: 30, costINR: 200, costLocal: 5 },
      taxi: { durationMin: 25, costINR: 1000, costLocal: 30 },
      bus: { durationMin: 50, costINR: 100, costLocal: 3 }
    }
  };

  const arrival = parseDateTime(arrivalTime) || new Date();
  let departure = parseDateTime(departureTime);

  // If departure not provided or before arrival, default to 8 hours later
  if (!departure || departure <= arrival) {
    departure = new Date(arrival.getTime() + 8 * 60 * 60 * 1000);
  }

  const totalLayoverMinutes = Math.round((departure.getTime() - arrival.getTime()) / (1000 * 60));

  // 1. Airport Inbound Processing Time
  const immigrationCustomsMin = isInternationalFlight
    ? airport.processingTimes.averageImmigrationMin || airport.processingTimes.immigrationCustomsMin || 45
    : 20;

  const airportExitMin = airport.processingTimes.airportExitMin || 15;

  let luggageHandlingMin = 0;
  if (hasCheckedLuggage) {
    luggageHandlingMin = (airport.processingTimes.baggageClaimMin || 30) +
                         (airport.processingTimes.leftLuggageServiceMin || 15);
  }

  const totalAirportProcessingMinutes = immigrationCustomsMin + airportExitMin + luggageHandlingMin;

  // 2. City Transportation Time
  const selectedTransportKey = (preferredTransport || 'metro').toLowerCase();
  const transportOption = airport.transitToCity[selectedTransportKey] ||
                          airport.transitToCity.metro ||
                          airport.transitToCity.taxi ||
                          { durationMin: 30, costINR: 200 };

  const travelToCityMinutes = transportOption.durationMin || 30;
  const travelBackToAirportMinutes = transportOption.durationMin || 30;
  const totalTransitMinutes = travelToCityMinutes + travelBackToAirportMinutes;

  // 3. Recommended Airport Return Safety Buffer
  const defaultSafetyBuffer = isInternationalFlight
    ? (airport.safetyBuffers.internationalReturnBufferMin || 120)
    : (airport.safetyBuffers.domesticReturnBufferMin || 90);

  const airportSafetyBufferMinutes = customBufferMinutes !== null && customBufferMinutes !== undefined
    ? Number(customBufferMinutes)
    : defaultSafetyBuffer;

  // 4. Net Usable Exploration Time
  const unusableMinutes = totalAirportProcessingMinutes + totalTransitMinutes + airportSafetyBufferMinutes;
  const actualExplorationMinutes = Math.max(0, totalLayoverMinutes - unusableMinutes);

  // 5. Critical Timestamps
  const cityArrivalTime = new Date(arrival.getTime() + (totalAirportProcessingMinutes + travelToCityMinutes) * 60 * 1000);
  const recommendedAirportReturnTime = new Date(departure.getTime() - airportSafetyBufferMinutes * 60 * 1000);
  const latestCityDepartureTime = new Date(recommendedAirportReturnTime.getTime() - travelBackToAirportMinutes * 60 * 1000);

  const isViable = actualExplorationMinutes >= 60; // Minimum 1 hour exploration needed to safely recommend leaving

  return {
    airport,
    timestamps: {
      arrivalTime: arrival.toISOString(),
      departureTime: departure.toISOString(),
      cityArrivalTime: cityArrivalTime.toISOString(),
      latestCityDepartureTime: latestCityDepartureTime.toISOString(),
      recommendedAirportReturnTime: recommendedAirportReturnTime.toISOString()
    },
    breakdownMinutes: {
      totalLayoverMinutes,
      immigrationCustomsMin,
      airportExitMin,
      luggageHandlingMin,
      totalAirportProcessingMinutes,
      travelToCityMinutes,
      travelBackToAirportMinutes,
      totalTransitMinutes,
      airportSafetyBufferMinutes,
      actualExplorationMinutes
    },
    formatted: {
      totalLayover: formatDuration(totalLayoverMinutes),
      airportProcessing: formatDuration(totalAirportProcessingMinutes),
      transitTime: formatDuration(totalTransitMinutes),
      airportSafetyBuffer: formatDuration(airportSafetyBufferMinutes),
      actualExplorationTime: formatDuration(actualExplorationMinutes),
      arrivalTimeFormatted: arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      departureTimeFormatted: departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendedReturnFormatted: recommendedAirportReturnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latestCityDepartureFormatted: latestCityDepartureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    transportUsed: {
      mode: selectedTransportKey,
      name: transportOption.name || 'Rapid Transit',
      oneWayDurationMin: travelToCityMinutes,
      estimatedCostINR: transportOption.costINR || 200,
      estimatedCostLocal: transportOption.costLocal || 5
    },
    hasCheckedLuggage,
    isInternationalFlight,
    isViableForCityExploration: isViable,
    recommendationReason: isViable
      ? `You have ${formatDuration(actualExplorationMinutes)} of safe exploration time after accounting for all airport procedures and safety margins.`
      : `Your available exploration time (${formatDuration(actualExplorationMinutes)}) is too brief to safely leave the airport and return before your flight.`
  };
};

module.exports = {
  calculateLayoverTimes,
  formatDuration,
  parseDateTime
};
