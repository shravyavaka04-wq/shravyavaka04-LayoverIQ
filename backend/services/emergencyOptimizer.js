const { getAirportByCode } = require('../data/airports');
const { calculateLayoverTimes, formatDuration, parseDateTime } = require('./layoverCalculator');
const { estimateTransit } = require('../utils/distanceCalculator');

/**
 * "🚨 I'M RUNNING LATE" Emergency Protocol Optimizer
 */
const optimizeEmergencyDelay = ({
  delayMinutes = 35,
  airportCode = 'DXB',
  arrivalTime,
  departureTime,
  hasCheckedLuggage = false,
  isInternationalFlight = true,
  currentStopIndex = 1, // which stop traveler is currently at
  currentLocationName = 'Downtown City Center',
  currentCoordinates = null
}) => {
  const airport = getAirportByCode(airportCode) || {
    code: airportCode || 'DXB',
    name: 'International Airport',
    coordinates: { lat: 25.2532, lng: 55.3657 },
    emergencyContacts: { airportPolice: '+971 4 216 2222', touristHelpline: '800 4888' },
    safetyBuffers: { internationalReturnBufferMin: 120, domesticReturnBufferMin: 90 },
    transitToCity: { taxi: { durationMin: 20, costINR: 850, costLocal: 38 } }
  };

  const arrival = parseDateTime(arrivalTime) || new Date();
  let departure = parseDateTime(departureTime);
  if (!departure || departure <= arrival) {
    departure = new Date(arrival.getTime() + 8 * 60 * 60 * 1000);
  }

  const defaultCoord = currentCoordinates || {
    lat: airport.coordinates.lat + 0.04,
    lng: airport.coordinates.lng - 0.04
  };

  // 1. Calculate fastest taxi return route
  const taxiTransit = estimateTransit(defaultCoord, airport.coordinates, 'taxi');
  const fastestReturnDurationMin = Math.max(15, taxiTransit.durationMin);

  // 2. Minimum required buffer at terminal (bare minimum to not miss boarding)
  const absoluteMinimumBufferMin = isInternationalFlight ? 75 : 50;
  const recommendedBufferMin = isInternationalFlight ? 120 : 90;

  // 3. Calculate latest possible departure time from current spot
  const now = new Date();
  const latestSafeCityDepartureDate = new Date(departure.getTime() - (absoluteMinimumBufferMin + fastestReturnDurationMin) * 60 * 1000);
  const recommendedCityDepartureDate = new Date(departure.getTime() - (recommendedBufferMin + fastestReturnDurationMin) * 60 * 1000);

  // 4. Time recovery actions
  const actionsTaken = [];
  let minutesRecovered = 0;

  // Action 1: Force switch to express taxi
  actionsTaken.push({
    priority: 1,
    action: 'SWITCH TO FASTEST TAXI / CAB',
    impact: `Saves ~15–20 minutes compared to public transit schedules.`,
    instruction: `Hail an official taxi or open Uber/Grab/Careem immediately. Head directly to ${airport.name}.`
  });
  minutesRecovered += 18;

  // Action 2: Skip all remaining secondary stops
  actionsTaken.push({
    priority: 2,
    action: 'SKIP REMAINING ATTRACTIONS & SHOPPING',
    impact: `Eliminates waiting and queuing delays.`,
    instruction: `Cancel any remaining planned visits immediately. Proceed straight to vehicle pick-up.`
  });
  minutesRecovered += Math.max(30, delayMinutes);

  // Action 3: Fast-track airport navigation
  if (hasCheckedLuggage) {
    actionsTaken.push({
      priority: 3,
      action: 'DIRECT ROUTE TO LEFT-LUGGAGE CLAIM',
      impact: `Prepares for baggage retrieval before security.`,
      instruction: `Enter via Arrivals Hall Luggage Storage counter first, then take express escalator to Departure Security.`
    });
  } else {
    actionsTaken.push({
      priority: 3,
      action: 'PROCEED DIRECTLY TO SECURITY SCREENING',
      impact: `You have no checked baggage delay.`,
      instruction: `Have mobile boarding pass and passport open in hand before stepping into the terminal.`
    });
  }

  // 5. Emergency Emergency Steps
  const emergencySteps = [
    {
      step: 1,
      title: 'Current Status Alert',
      time: 'IMMEDIATELY',
      instruction: `You are running approximately ${delayMinutes} minutes behind standard schedule at ${currentLocationName}.`,
      type: 'warning'
    },
    {
      step: 2,
      title: 'Board Emergency Taxi',
      time: recommendedCityDepartureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      instruction: `Depart your current location by NO LATER than ${latestSafeCityDepartureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      type: 'critical_departure'
    },
    {
      step: 3,
      title: `Arrival at ${airport.code} Terminal`,
      time: new Date(latestSafeCityDepartureDate.getTime() + fastestReturnDurationMin * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      instruction: `Enter terminal departures. Follow "Priority / All Gates" overhead signs.`,
      type: 'airport_entry'
    },
    {
      step: 4,
      title: 'Boarding Gate Deadline',
      time: departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      instruction: `Flight departure. Boarding gates close 20–25 minutes before scheduled takeoff.`,
      type: 'flight_gate'
    }
  ];

  return {
    success: true,
    delayMinutes,
    alertHeadline: `🚨 EMERGENCY REROUTE: ${delayMinutes} MINUTE DELAY RECOVERY PROTOCOL`,
    statusSeverity: delayMinutes > 45 ? 'CRITICAL' : 'URGENT',
    currentLocation: currentLocationName,
    fastestTransit: {
      mode: 'Taxi / Rideshare Express',
      durationMin: fastestReturnDurationMin,
      durationFormatted: formatDuration(fastestReturnDurationMin),
      estimatedCostINR: taxiTransit.costINR || 850,
      estimatedCostLocal: taxiTransit.costLocal || 40
    },
    deadlines: {
      latestCityDepartureFormatted: latestSafeCityDepartureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendedCityDepartureFormatted: recommendedCityDepartureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      flightDepartureFormatted: departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      remainingBufferWithTaxiFormatted: formatDuration(absoluteMinimumBufferMin)
    },
    actionsTaken,
    emergencySteps,
    airportContacts: airport.emergencyContacts || {
      airportPolice: 'Dial 112 or local airport helpdesk',
      touristHelpline: 'Airport Customer Care'
    },
    actionSummary: `You are running ${delayMinutes} minutes behind schedule. Skip all shopping and non-critical stops. Take an express taxi directly to ${airport.code}. Depart your current location by ${latestSafeCityDepartureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to safely make your flight.`
  };
};

module.exports = {
  optimizeEmergencyDelay
};
