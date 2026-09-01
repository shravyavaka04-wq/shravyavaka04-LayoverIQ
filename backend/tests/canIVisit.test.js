const { evaluateCanIVisit } = require('../services/canIVisitEngine');

describe('"Can I Actually Visit This?" Feasibility Engine', () => {
  test('Evaluates safe visit for Burj Khalifa on 8-hour Dubai layover', () => {
    const result = evaluateCanIVisit({
      airportCode: 'DXB',
      attractionId: 'dxb_burj_khalifa',
      arrivalTime: '2026-09-01T10:00:00Z',
      departureTime: '2026-09-01T18:00:00Z',
      transportMode: 'metro'
    });

    expect(result.status).toBe('SAFE');
    expect(result.badgeColor).toBe('green');
    expect(result.calculation.travelFromAirportMin).toBeGreaterThan(0);
    expect(result.calculation.recommendedVisitDurationMin).toBeGreaterThan(0);
    expect(result.calculation.actualBufferBeforeFlightMin).toBeGreaterThanOrEqual(120);
    expect(result.timelinePreview.estimatedAirportReturn).toBeDefined();
  });

  test('Flags a 3-hour layover as NOT RECOMMENDED for distant attraction', () => {
    const result = evaluateCanIVisit({
      airportCode: 'DXB',
      attractionId: 'dxb_burj_khalifa',
      arrivalTime: '2026-09-01T10:00:00Z',
      departureTime: '2026-09-01T13:00:00Z', // Only 3 hours
      transportMode: 'metro'
    });

    expect(result.status).toBe('NOT_RECOMMENDED');
    expect(result.badgeColor).toBe('red');
    expect(result.advice).toContain('Insufficient');
  });
});
