/**
 * Distance and Transit Calculator using the Haversine formula
 */

// Calculate great-circle distance between two points on the Earth's surface in kilometers
const calculateDistanceKm = (coord1, coord2) => {
  if (!coord1 || !coord2) return 5.0; // fallback default
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return parseFloat((R * c).toFixed(2));
};

// Estimate transit duration in minutes and estimated cost in INR based on distance and transport mode
const estimateTransit = (fromCoord, toCoord, mode = 'metro', airportData = null) => {
  const distanceKm = calculateDistanceKm(fromCoord, toCoord);
  let durationMin = 0;
  let costINR = 0;
  let costLocal = 0;
  let reliabilityScore = 90;

  switch (mode.toLowerCase()) {
    case 'taxi':
    case 'cab':
      // Average city speed 30-40 km/h with 5-min pickup buffer
      durationMin = Math.max(12, Math.round((distanceKm / 35) * 60 + 5));
      costINR = Math.max(300, Math.round(distanceKm * 40 + 150));
      costLocal = Math.max(15, Math.round(distanceKm * 2.5 + 10));
      reliabilityScore = 88;
      break;

    case 'metro':
    case 'train':
      // Average metro speed 40-50 km/h + 8-min station buffer & headways
      durationMin = Math.max(15, Math.round((distanceKm / 45) * 60 + 8));
      costINR = Math.max(60, Math.round(distanceKm * 8 + 30));
      costLocal = Math.max(3, Math.round(distanceKm * 0.4 + 1.5));
      reliabilityScore = 98; // Metros do not get stuck in road traffic
      break;

    case 'bus':
      // Average bus speed 20 km/h + 12-min wait buffer
      durationMin = Math.max(20, Math.round((distanceKm / 20) * 60 + 12));
      costINR = Math.max(40, Math.round(distanceKm * 4 + 20));
      costLocal = Math.max(2, Math.round(distanceKm * 0.2 + 1));
      reliabilityScore = 80;
      break;

    case 'walking':
    case 'walk':
      // Average walking speed 4.5 km/h
      durationMin = Math.round((distanceKm / 4.5) * 60);
      costINR = 0;
      costLocal = 0;
      reliabilityScore = 99;
      break;

    case 'any':
    default:
      // Default to metro if distance > 3km else taxi/metro mix
      if (distanceKm > 10) {
        durationMin = Math.max(15, Math.round((distanceKm / 45) * 60 + 8));
        costINR = Math.max(80, Math.round(distanceKm * 10 + 30));
        costLocal = Math.max(4, Math.round(distanceKm * 0.5 + 2));
        reliabilityScore = 95;
      } else {
        durationMin = Math.max(10, Math.round((distanceKm / 35) * 60 + 5));
        costINR = Math.max(200, Math.round(distanceKm * 35 + 100));
        costLocal = Math.max(10, Math.round(distanceKm * 2 + 5));
        reliabilityScore = 90;
      }
      break;
  }

  return {
    distanceKm,
    durationMin,
    costINR,
    costLocal,
    reliabilityScore,
    mode
  };
};

module.exports = {
  calculateDistanceKm,
  estimateTransit
};
