/**
 * LayoverIQ Budget Planning Service
 */

const calculateBudgetEstimate = ({
  userBudget = 3000,
  travelers = 1,
  transportMode = 'metro',
  selectedAttractions = [],
  hasCheckedLuggage = false,
  mealsCount = 1,
  diningPreference = 'medium' // 'low' (street food), 'medium' (cafe/casual), 'high' (fine dining)
}) => {
  const count = Math.max(1, Number(travelers) || 1);

  // 1. Transportation cost
  let transportPerPersonINR = 200;
  if (transportMode === 'taxi') transportPerPersonINR = 900;
  else if (transportMode === 'bus') transportPerPersonINR = 120;
  else if (transportMode === 'walking') transportPerPersonINR = 0;
  else transportPerPersonINR = 250; // metro default

  const totalTransportINR = transportPerPersonINR * count;

  // 2. Attraction tickets cost
  let totalAttractionTicketsINR = 0;
  selectedAttractions.forEach(attr => {
    totalAttractionTicketsINR += (Number(attr.costINR) || 0) * count;
  });

  // 3. Food and dining cost
  let mealPerPersonINR = 500;
  if (diningPreference === 'low') mealPerPersonINR = 250;
  else if (diningPreference === 'high') mealPerPersonINR = 1500;
  else mealPerPersonINR = 600;

  const totalFoodINR = mealPerPersonINR * mealsCount * count;

  // 4. Luggage storage
  const luggageStorageINR = hasCheckedLuggage ? (400 * count) : 0;

  // 5. Emergency reserve buffer (15% of estimated base or min 400 INR)
  const baseCost = totalTransportINR + totalAttractionTicketsINR + totalFoodINR + luggageStorageINR;
  const emergencyReserveINR = Math.max(400, Math.round(baseCost * 0.15));

  const grandTotalINR = baseCost + emergencyReserveINR;
  const numericUserBudget = Number(userBudget) || 3000;
  const fitsBudget = numericUserBudget >= grandTotalINR;
  const varianceINR = numericUserBudget - grandTotalINR;

  const categories = [
    { name: 'Transportation', amountINR: totalTransportINR, percentage: Math.round((totalTransportINR / grandTotalINR) * 100) || 0, icon: 'car' },
    { name: 'Attraction Tickets', amountINR: totalAttractionTicketsINR, percentage: Math.round((totalAttractionTicketsINR / grandTotalINR) * 100) || 0, icon: 'ticket' },
    { name: 'Food & Dining', amountINR: totalFoodINR, percentage: Math.round((totalFoodINR / grandTotalINR) * 100) || 0, icon: 'utensils' },
    { name: 'Luggage Storage', amountINR: luggageStorageINR, percentage: Math.round((luggageStorageINR / grandTotalINR) * 100) || 0, icon: 'briefcase' },
    { name: 'Emergency Reserve', amountINR: emergencyReserveINR, percentage: Math.round((emergencyReserveINR / grandTotalINR) * 100) || 0, icon: 'shield' }
  ].filter(c => c.amountINR > 0);

  return {
    userBudget: numericUserBudget,
    grandTotalINR,
    fitsBudget,
    varianceINR,
    varianceFormatted: varianceINR >= 0 ? `+₹${varianceINR} surplus` : `-₹${Math.abs(varianceINR)} deficit`,
    breakdown: {
      transport: totalTransportINR,
      attractions: totalAttractionTicketsINR,
      food: totalFoodINR,
      luggage: luggageStorageINR,
      emergencyReserve: emergencyReserveINR
    },
    categories,
    advice: fitsBudget
      ? `Your ₹${numericUserBudget} budget comfortably covers all estimated transit, meals, and entry tickets with a ₹${emergencyReserveINR} emergency buffer.`
      : `Estimated total (₹${grandTotalINR}) exceeds your ₹${numericUserBudget} budget by ₹${Math.abs(varianceINR)}. Consider switching to Metro transport or selecting free landmark attractions.`
  };
};

module.exports = {
  calculateBudgetEstimate
};
