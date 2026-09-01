const { calculateLayoverTimes } = require('../services/layoverCalculator');

describe('Smart Layover Calculator Service', () => {
  test('Calculates 8-hour Dubai layover accurately', () => {
    const arrival = new Date('2026-09-01T10:00:00Z');
    const departure = new Date('2026-09-01T18:00:00Z'); // 8 hours = 480 mins

    const result = calculateLayoverTimes({
      airportCode: 'DXB',
      arrivalTime: arrival.toISOString(),
      departureTime: departure.toISOString(),
      hasCheckedLuggage: false,
      isInternationalFlight: true,
      preferredTransport: 'metro'
    });

    expect(result.breakdownMinutes.totalLayoverMinutes).toBe(480);
    // Airport processing: 45 min immigration + 15 min exit = 60 min
    expect(result.breakdownMinutes.totalAirportProcessingMinutes).toBe(60);
    // Safety buffer: 120 min (2 hours)
    expect(result.breakdownMinutes.airportSafetyBufferMinutes).toBe(120);
    // Transit: 25 min each way = 50 min
    expect(result.breakdownMinutes.totalTransitMinutes).toBe(50);
    // Usable exploration: 480 - 60 - 50 - 120 = 250 min (4 hours 10 min)
    expect(result.breakdownMinutes.actualExplorationMinutes).toBe(250);
    expect(result.isViableForCityExploration).toBe(true);
  });

  test('Adds luggage handling buffer when traveler has checked bags', () => {
    const arrival = new Date('2026-09-01T10:00:00Z');
    const departure = new Date('2026-09-01T18:00:00Z');

    const withLuggage = calculateLayoverTimes({
      airportCode: 'DXB',
      arrivalTime: arrival.toISOString(),
      departureTime: departure.toISOString(),
      hasCheckedLuggage: true
    });

    const withoutLuggage = calculateLayoverTimes({
      airportCode: 'DXB',
      arrivalTime: arrival.toISOString(),
      departureTime: departure.toISOString(),
      hasCheckedLuggage: false
    });

    expect(withLuggage.breakdownMinutes.luggageHandlingMin).toBeGreaterThan(0);
    expect(withLuggage.breakdownMinutes.actualExplorationMinutes).toBeLessThan(
      withoutLuggage.breakdownMinutes.actualExplorationMinutes
    );
  });

  test('Identifies short layover (2.5 hours) as not viable for city exploration', () => {
    const arrival = new Date('2026-09-01T10:00:00Z');
    const departure = new Date('2026-09-01T12:30:00Z'); // 2.5 hours = 150 mins

    const result = calculateLayoverTimes({
      airportCode: 'DXB',
      arrivalTime: arrival.toISOString(),
      departureTime: departure.toISOString(),
      isInternationalFlight: true
    });

    // 150 min total - 60 min processing - 50 min transit - 120 min buffer = < 0 min
    expect(result.breakdownMinutes.actualExplorationMinutes).toBe(0);
    expect(result.isViableForCityExploration).toBe(false);
  });
});
