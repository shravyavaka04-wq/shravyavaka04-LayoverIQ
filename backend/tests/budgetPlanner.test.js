const { calculateBudgetEstimate } = require('../services/budgetPlanner');

describe('Budget Planning and Estimation Service', () => {
  test('Calculates multi-category breakdown with emergency reserve', () => {
    const result = calculateBudgetEstimate({
      userBudget: 3500,
      travelers: 1,
      transportMode: 'metro',
      selectedAttractions: [
        { name: 'Burj Khalifa', costINR: 1200 },
        { name: 'Al Fahidi', costINR: 250 }
      ],
      hasCheckedLuggage: false
    });

    expect(result.grandTotalINR).toBeGreaterThan(0);
    expect(result.breakdown.transport).toBeDefined();
    expect(result.breakdown.food).toBeDefined();
    expect(result.breakdown.attractions).toBe(1450);
    expect(result.breakdown.emergencyReserve).toBeGreaterThanOrEqual(400);
    expect(result.fitsBudget).toBe(true);
  });

  test('Flags deficit when budget is insufficient', () => {
    const result = calculateBudgetEstimate({
      userBudget: 500, // unrealistically low budget
      travelers: 2,
      transportMode: 'taxi',
      selectedAttractions: [
        { name: 'Museum of Future', costINR: 3400 }
      ]
    });

    expect(result.fitsBudget).toBe(false);
    expect(result.varianceINR).toBeLessThan(0);
  });
});
