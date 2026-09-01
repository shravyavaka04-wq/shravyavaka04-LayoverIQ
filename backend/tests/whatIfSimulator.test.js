const { simulateWhatIf } = require('../services/whatIfSimulator');

describe('"What If?" Layover Dynamic Simulator', () => {
  const baseParams = {
    airportCode: 'DXB',
    arrivalTime: '2026-09-01T10:00:00Z',
    departureTime: '2026-09-01T18:00:00Z',
    budget: 3000,
    interests: ['landmarks', 'shopping'],
    preferredTransport: 'metro',
    travelers: 1,
    hasCheckedLuggage: false,
    isInternationalFlight: true
  };

  test('Simulating +60 minutes extra exploration decreases remaining airport buffer', () => {
    const simulation = simulateWhatIf({
      baseParams,
      perturbations: {
        extraDurationMinutes: 60
      }
    });

    expect(simulation.success).toBe(true);
    expect(simulation.simulated.bufferMinutes).toBeLessThan(simulation.original.bufferMinutes);
    expect(simulation.comparison.scoreDelta).toBeLessThanOrEqual(0);
    expect(simulation.comparison.appliedChanges.length).toBeGreaterThan(0);
  });

  test('Simulating excessive delay (+180 min) triggers danger and high risk', () => {
    const simulation = simulateWhatIf({
      baseParams,
      perturbations: {
        extraDurationMinutes: 180
      }
    });

    expect(simulation.simulated.riskLevel).toBe('HIGH RISK');
    expect(simulation.isStillSafe).toBe(false);
    expect(simulation.simulated.badgeColor).toBe('red');
  });
});
