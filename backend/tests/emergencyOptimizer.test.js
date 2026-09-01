const { optimizeEmergencyDelay } = require('../services/emergencyOptimizer');

describe('"🚨 I\'M RUNNING LATE" Emergency Protocol Optimizer', () => {
  test('Generates recovery actions and latest departure deadline for 35 min delay', () => {
    const result = optimizeEmergencyDelay({
      delayMinutes: 35,
      airportCode: 'DXB',
      arrivalTime: '2026-09-01T10:00:00Z',
      departureTime: '2026-09-01T18:00:00Z',
      hasCheckedLuggage: false,
      isInternationalFlight: true
    });

    expect(result.success).toBe(true);
    expect(result.delayMinutes).toBe(35);
    expect(result.fastestTransit.mode).toContain('Taxi');
    expect(result.deadlines.latestCityDepartureFormatted).toBeDefined();
    expect(result.actionsTaken.length).toBeGreaterThan(0);
    expect(result.emergencySteps.length).toBe(4);
    expect(result.airportContacts.airportPolice).toBeDefined();
  });
});
