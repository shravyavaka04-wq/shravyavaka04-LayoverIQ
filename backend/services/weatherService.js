/**
 * Weather-Aware Intelligence Service for LayoverIQ
 */

const cityWeatherPatterns = {
  DXB: { city: 'Dubai', tempC: 34, condition: 'Sunny & Warm', isRain: false, isHeat: true, icon: 'sun', humidity: '45%' },
  SIN: { city: 'Singapore', tempC: 29, condition: 'Tropical Showers', isRain: true, isHeat: false, icon: 'cloud-rain', humidity: '85%' },
  LHR: { city: 'London', tempC: 17, condition: 'Light Drizzle & Overcast', isRain: true, isHeat: false, icon: 'cloud-drizzle', humidity: '78%' },
  HND: { city: 'Tokyo', tempC: 22, condition: 'Clear Sky', isRain: false, isHeat: false, icon: 'sun', humidity: '55%' },
  CDG: { city: 'Paris', tempC: 19, condition: 'Partly Cloudy', isRain: false, isHeat: false, icon: 'cloud', humidity: '60%' },
  DEL: { city: 'Delhi', tempC: 31, condition: 'Hazy Sun', isRain: false, isHeat: false, icon: 'sun', humidity: '50%' },
  JFK: { city: 'New York', tempC: 21, condition: 'Sunny & Pleasant', isRain: false, isHeat: false, icon: 'sun', humidity: '52%' }
};

const getCityWeather = (airportCode = 'DXB') => {
  const code = (airportCode || 'DXB').toUpperCase();
  const weather = cityWeatherPatterns[code] || {
    city: 'Transit City',
    tempC: 24,
    condition: 'Clear Sky',
    isRain: false,
    isHeat: false,
    icon: 'sun',
    humidity: '50%'
  };

  let recommendation = 'Weather conditions are optimal for outdoor walking and sightseeing.';
  if (weather.isRain) {
    recommendation = `🌧️ Rain is expected in ${weather.city}. We automatically prioritize air-conditioned indoor attractions, museums, and covered markets.`;
  } else if (weather.isHeat) {
    recommendation = `☀️ Warm temperatures (${weather.tempC}°C) in ${weather.city}. Stay hydrated and utilize air-conditioned Metro / Taxi transport.`;
  }

  return {
    ...weather,
    recommendation,
    badgeText: weather.isRain ? '🌧️ Weather-aware recommendation' : (weather.isHeat ? '☀️ Heat advisory' : '🌤️ Great weather')
  };
};

module.exports = {
  getCityWeather
};
