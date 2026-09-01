const { calculateRiskScore } = require('../services/riskScorer');
const { calculateLayoverTimes } = require('../services/layoverCalculator');

describe('Multi-Factor Risk Scoring Engine', () => {
  test('Yields LOW RISK (>=85) for comfortable layover with high buffer and low hops', () => {
    const layoverCalc = calculateLayoverTimes({
      airportCode: 'DXB',
      arrivalTime: '2026-09-01T10:00:00Z',
      departureTime: '2026-09-01T18:00:00Z',
      isInternationalFlight: true
    });

    const risk = calculateRiskScore({
      layoverCalculation: layoverCalc,
      totalAttractionDurationMin: 120, // 2 hours of visits out of ~4h exploration
      attractionCount: 2,
      transportMode: 'metro',
      weatherCondition: 'clear',
      hasCheckedLuggage: false
    });

    expect(risk.score).toBeGreaterThanOrEqual(85);
    expect(risk.level).toBe('LOW RISK');
    expect(risk.badgeColor).toBe('green');
    expect(risk.factors.length).toBeGreaterThan(0);
  });

  test('Yields MEDIUM or HIGH RISK when itinerary is overbooked', () => {
    const layoverCalc = calculateLayoverTimes({
      airportCode: 'DXB',
      arrivalTime: '2026-09-01T10:00:00Z',
      departureTime: '2026-09-01T18:00:00Z'
    });

    const risk = calculateRiskScore({
      layoverCalculation: layoverCalc,
      totalAttractionDurationMin: 320, // Exceeds 250 min available!
      attractionCount: 5,
      transportMode: 'bus',
      weatherCondition: 'thunderstorm',
      hasCheckedLuggage: true
    });

    expect(risk.score).toBeLessThan(85);
    expect(['MEDIUM RISK', 'HIGH RISK']).toContain(risk.level);
  });

  test('Returns HIGH RISK immediately for non-viable layover', () => {
    const layoverCalc = calculateLayoverTimes({
      airportCode: 'DXB',
      arrivalTime: '2026-09-01T10:00:00Z',
      departureTime: '2026-09-01T12:00:00Z' // Only 2 hours
    });

    const risk = calculateRiskScore({
      layoverCalculation: layoverCalc,
      totalAttractionDurationMin: 60,
      attractionCount: 1
    });

    expect(risk.score).toBeLessThan(60);
    expect(risk.level).toBe('HIGH RISK');
    expect(risk.badgeColor).toBe('red');
  });
});
