const airports = [
  {
    code: 'DXB',
    name: 'Dubai International Airport',
    city: 'Dubai',
    country: 'United Arab Emirates',
    currency: 'AED',
    currencySymbol: 'AED ',
    coordinates: { lat: 25.2532, lng: 55.3657 },
    processingTimes: {
      immigrationCustomsMin: 40,
      immigrationCustomsMax: 60,
      averageImmigrationMin: 45,
      airportExitMin: 15,
      baggageClaimMin: 30,
      leftLuggageServiceMin: 20
    },
    safetyBuffers: {
      internationalReturnBufferMin: 120, // 2 hours
      domesticReturnBufferMin: 90,
      boardingGateCloseBeforeDepartureMin: 25
    },
    transitToCity: {
      metro: { name: 'Dubai Metro Red Line', durationMin: 25, costINR: 180, costLocal: 8, frequencyMin: 5, reliabilityScore: 98 },
      taxi: { name: 'Dubai Taxi (Careem/Uber/RTA)', durationMin: 20, costINR: 850, costLocal: 38, frequencyMin: 2, reliabilityScore: 90 },
      bus: { name: 'RTA Bus Network', durationMin: 45, costINR: 110, costLocal: 5, frequencyMin: 15, reliabilityScore: 82 }
    },
    emergencyContacts: {
      airportPolice: '+971 4 216 2222',
      medicalEmergency: '+971 4 216 1999',
      lostAndFound: '+971 4 224 5555',
      touristHelpline: '800 4888'
    },
    terminals: ['Terminal 1 (International)', 'Terminal 2 (Flydubai)', 'Terminal 3 (Emirates)'],
    luggageStorage: {
      available: true,
      locations: 'Terminal 1 & Terminal 3 Arrivals Hall',
      costPerItemPerHourLocal: 5
    },
    visaTransitNotice: 'Transit visa available on arrival for select nationalities; 48-hour or 96-hour transit visa can be issued. Verify entry requirements before leaving airport.'
  },
  {
    code: 'SIN',
    name: 'Singapore Changi Airport',
    city: 'Singapore',
    country: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$',
    coordinates: { lat: 1.3644, lng: 103.9915 },
    processingTimes: {
      immigrationCustomsMin: 30,
      immigrationCustomsMax: 45,
      averageImmigrationMin: 35,
      airportExitMin: 15,
      baggageClaimMin: 25,
      leftLuggageServiceMin: 15
    },
    safetyBuffers: {
      internationalReturnBufferMin: 120,
      domesticReturnBufferMin: 90,
      boardingGateCloseBeforeDepartureMin: 20
    },
    transitToCity: {
      metro: { name: 'MRT East West Line (Changi to City Hall)', durationMin: 30, costINR: 160, costLocal: 2.5, frequencyMin: 6, reliabilityScore: 99 },
      taxi: { name: 'Singapore Grab / Metered Taxi', durationMin: 22, costINR: 1400, costLocal: 22, frequencyMin: 3, reliabilityScore: 94 },
      bus: { name: 'Public Bus 36', durationMin: 55, costINR: 130, costLocal: 2.0, frequencyMin: 10, reliabilityScore: 88 }
    },
    emergencyContacts: {
      airportPolice: '+65 6546 0000',
      medicalEmergency: '+65 6543 2223',
      lostAndFound: '+65 6595 6868',
      touristHelpline: '1800 736 2000'
    },
    terminals: ['Jewel Changi', 'Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 4'],
    luggageStorage: {
      available: true,
      locations: 'Baggage Storage Counters across all Terminals (Public & Transit areas)',
      costPerItemPerHourLocal: 4
    },
    visaTransitNotice: 'Visa-Free Transit Facility (VFTF) available for 96 hours for eligible nationals transiting to a third country.'
  },
  {
    code: 'LHR',
    name: 'London Heathrow Airport',
    city: 'London',
    country: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    coordinates: { lat: 51.4700, lng: -0.4543 },
    processingTimes: {
      immigrationCustomsMin: 45,
      immigrationCustomsMax: 75,
      averageImmigrationMin: 50,
      airportExitMin: 20,
      baggageClaimMin: 35,
      leftLuggageServiceMin: 20
    },
    safetyBuffers: {
      internationalReturnBufferMin: 150, // 2.5 hours
      domesticReturnBufferMin: 100,
      boardingGateCloseBeforeDepartureMin: 30
    },
    transitToCity: {
      metro: { name: 'Elizabeth Line / Piccadilly Underground', durationMin: 35, costINR: 1300, costLocal: 12.8, frequencyMin: 5, reliabilityScore: 95 },
      taxi: { name: 'Black Cab / Uber Heathrow', durationMin: 45, costINR: 6500, costLocal: 65, frequencyMin: 5, reliabilityScore: 80 },
      bus: { name: 'National Express Coach', durationMin: 60, costINR: 1000, costLocal: 10, frequencyMin: 20, reliabilityScore: 78 }
    },
    emergencyContacts: {
      airportPolice: '+44 20 8759 1212',
      medicalEmergency: '999 / 112',
      lostAndFound: '+44 20 8634 4000',
      touristHelpline: '+44 20 7332 1456'
    },
    terminals: ['Terminal 2 (The Queen\'s Terminal)', 'Terminal 3', 'Terminal 4', 'Terminal 5 (British Airways)'],
    luggageStorage: {
      available: true,
      locations: 'Excess Baggage Company in T2, T3, T4, T5 Arrivals',
      costPerItemPerHourLocal: 7.5
    },
    visaTransitNotice: 'Transit without visa (TWOV) scheme available for qualifying passengers. Biometric entry required.'
  },
  {
    code: 'HND',
    name: 'Tokyo Haneda Airport',
    city: 'Tokyo',
    country: 'Japan',
    currency: 'JPY',
    currencySymbol: '¥',
    coordinates: { lat: 35.5494, lng: 139.7798 },
    processingTimes: {
      immigrationCustomsMin: 35,
      immigrationCustomsMax: 50,
      averageImmigrationMin: 40,
      airportExitMin: 15,
      baggageClaimMin: 25,
      leftLuggageServiceMin: 15
    },
    safetyBuffers: {
      internationalReturnBufferMin: 120,
      domesticReturnBufferMin: 75,
      boardingGateCloseBeforeDepartureMin: 20
    },
    transitToCity: {
      metro: { name: 'Tokyo Monorail / Keikyu Airport Line', durationMin: 18, costINR: 350, costLocal: 600, frequencyMin: 4, reliabilityScore: 99.5 },
      taxi: { name: 'Tokyo MK Taxi / JapanTaxi', durationMin: 25, costINR: 4200, costLocal: 7500, frequencyMin: 3, reliabilityScore: 92 },
      bus: { name: 'Airport Limousine Bus', durationMin: 35, costINR: 700, costLocal: 1200, frequencyMin: 15, reliabilityScore: 90 }
    },
    emergencyContacts: {
      airportPolice: '+81 3 5757 0110',
      medicalEmergency: '119',
      lostAndFound: '+81 3 5757 8107',
      touristHelpline: '+81 3 3201 3331'
    },
    terminals: ['Terminal 1', 'Terminal 2', 'Terminal 3 (International)'],
    luggageStorage: {
      available: true,
      locations: 'Coin Lockers and Baggage Delivery Counters (T3 2F/3F)',
      costPerItemPerHourLocal: 500
    },
    visaTransitNotice: 'Shore Pass granted at immigration discretion for 72 hours if connecting at same or nearby Tokyo airport.'
  },
  {
    code: 'CDG',
    name: 'Paris Charles de Gaulle Airport',
    city: 'Paris',
    country: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    coordinates: { lat: 49.0097, lng: 2.5479 },
    processingTimes: {
      immigrationCustomsMin: 45,
      immigrationCustomsMax: 70,
      averageImmigrationMin: 50,
      airportExitMin: 20,
      baggageClaimMin: 35,
      leftLuggageServiceMin: 20
    },
    safetyBuffers: {
      internationalReturnBufferMin: 150,
      domesticReturnBufferMin: 90,
      boardingGateCloseBeforeDepartureMin: 25
    },
    transitToCity: {
      metro: { name: 'RER B Regional Train to Châtelet-Les Halles', durationMin: 35, costINR: 1100, costLocal: 11.8, frequencyMin: 8, reliabilityScore: 90 },
      taxi: { name: 'Paris Official Fixed-Fare Taxi', durationMin: 40, costINR: 5200, costLocal: 56, frequencyMin: 4, reliabilityScore: 82 },
      bus: { name: 'RoissyBus to Opera', durationMin: 60, costINR: 1450, costLocal: 16.2, frequencyMin: 15, reliabilityScore: 80 }
    },
    emergencyContacts: {
      airportPolice: '+33 1 48 62 31 22',
      medicalEmergency: '15 / 112',
      lostAndFound: '+33 1 48 62 13 34',
      touristHelpline: '+33 1 49 52 42 63'
    },
    terminals: ['Terminal 1', 'Terminal 2 (2A, 2B, 2C, 2D, 2E, 2F, 2G)', 'Terminal 3'],
    luggageStorage: {
      available: true,
      locations: 'Bagages du Monde at T2 level 4 near TGV station',
      costPerItemPerHourLocal: 7
    },
    visaTransitNotice: 'Schengen airport transit visa rules apply. Non-EU passengers entering France need valid Schengen visa.'
  },
  {
    code: 'DEL',
    name: 'Indira Gandhi International Airport',
    city: 'Delhi',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    coordinates: { lat: 28.5562, lng: 77.1000 },
    processingTimes: {
      immigrationCustomsMin: 40,
      immigrationCustomsMax: 65,
      averageImmigrationMin: 45,
      airportExitMin: 20,
      baggageClaimMin: 30,
      leftLuggageServiceMin: 15
    },
    safetyBuffers: {
      internationalReturnBufferMin: 150,
      domesticReturnBufferMin: 90,
      boardingGateCloseBeforeDepartureMin: 25
    },
    transitToCity: {
      metro: { name: 'Delhi Airport Express Line Metro', durationMin: 20, costINR: 60, costLocal: 60, frequencyMin: 7, reliabilityScore: 98 },
      taxi: { name: 'Uber / BluSmart / Prepaid Taxi', durationMin: 35, costINR: 550, costLocal: 550, frequencyMin: 3, reliabilityScore: 85 },
      bus: { name: 'DTC Airport Shuttle', durationMin: 55, costINR: 100, costLocal: 100, frequencyMin: 20, reliabilityScore: 75 }
    },
    emergencyContacts: {
      airportPolice: '+91 11 2565 2121',
      medicalEmergency: '+91 11 4965 2000',
      lostAndFound: '+91 11 4965 2400',
      touristHelpline: '1363'
    },
    terminals: ['Terminal 1 (Domestic Low Cost)', 'Terminal 2 (Domestic)', 'Terminal 3 (International & Full Service)'],
    luggageStorage: {
      available: true,
      locations: 'Left Luggage facility at Airport Connect Building (T3 Metro level)',
      costPerItemPerHourLocal: 50
    },
    visaTransitNotice: 'e-Transit visa or regular tourist e-Visa required for foreign passport holders to exit airport.'
  },
  {
    code: 'JFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    coordinates: { lat: 40.6413, lng: -73.7781 },
    processingTimes: {
      immigrationCustomsMin: 50,
      immigrationCustomsMax: 85,
      averageImmigrationMin: 60,
      airportExitMin: 25,
      baggageClaimMin: 40,
      leftLuggageServiceMin: 20
    },
    safetyBuffers: {
      internationalReturnBufferMin: 180, // 3 hours
      domesticReturnBufferMin: 120,
      boardingGateCloseBeforeDepartureMin: 30
    },
    transitToCity: {
      metro: { name: 'AirTrain + Subway (E/A Line or LIRR)', durationMin: 45, costINR: 950, costLocal: 11.25, frequencyMin: 6, reliabilityScore: 92 },
      taxi: { name: 'NYC Yellow Cab / Uber Flat Rate', durationMin: 50, costINR: 6500, costLocal: 75, frequencyMin: 4, reliabilityScore: 78 },
      bus: { name: 'NYC Express Bus', durationMin: 75, costINR: 1600, costLocal: 19, frequencyMin: 30, reliabilityScore: 72 }
    },
    emergencyContacts: {
      airportPolice: '+1 718 244 4335',
      medicalEmergency: '911',
      lostAndFound: '+1 718 244 4225',
      touristHelpline: '+1 212 484 1222'
    },
    terminals: ['Terminal 1', 'Terminal 4', 'Terminal 5', 'Terminal 7', 'Terminal 8'],
    luggageStorage: {
      available: true,
      locations: 'Terminal 1 & Terminal 4 Arrivals near baggage claim',
      costPerItemPerHourLocal: 15
    },
    visaTransitNotice: 'USA requires ESTA or Transit Visa (C-1) for all transit passengers even for short connections.'
  }
];

const getAirportByCode = (code) => {
  if (!code) return null;
  return airports.find(a => a.code.toUpperCase() === code.toUpperCase()) || null;
};

const getAirportsByCity = (cityName) => {
  if (!cityName) return [];
  return airports.filter(a => a.city.toLowerCase().includes(cityName.toLowerCase()));
};

module.exports = {
  airports,
  getAirportByCode,
  getAirportsByCity
};
