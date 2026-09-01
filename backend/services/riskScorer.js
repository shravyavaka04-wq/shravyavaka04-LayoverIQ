/**
 * Multi-Factor Risk Score Algorithm for Layover Exploration
 * Score ranges:
 * 🟢 LOW RISK — 85–100
 * 🟡 MEDIUM RISK — 60–84
 * 🔴 HIGH RISK — below 60
 */

const calculateRiskScore = ({
  layoverCalculation,
  totalAttractionDurationMin,
  attractionCount = 1,
  transportMode = 'metro',
  weatherCondition = 'clear',
  hasCheckedLuggage = false
}) => {
  const { breakdownMinutes, isViableForCityExploration } = layoverCalculation;
  const {
    actualExplorationMinutes,
    airportSafetyBufferMinutes,
    totalTransitMinutes,
    totalLayoverMinutes
  } = breakdownMinutes;

  if (!isViableForCityExploration || actualExplorationMinutes <= 0) {
    return {
      score: 25,
      level: 'HIGH RISK',
      badgeColor: 'red',
      summary: 'Available exploration time is insufficient. High probability of missing connecting flight.',
      factors: [
        { name: 'Time Availability', score: 10, weight: '40%', status: 'Critical', detail: 'Net exploration time is under 1 hour.' },
        { name: 'Airport Return Buffer', score: 30, weight: '30%', status: 'Warning', detail: 'Safety buffer compromised.' },
        { name: 'Transit Margin', score: 40, weight: '30%', status: 'Caution', detail: 'Zero margin for traffic or security delays.' }
      ]
    };
  }

  // 1. Buffer Ratio Score (Weight 30%)
  // Standard recommended buffer is 120-150 min
  let bufferScore = 100;
  if (airportSafetyBufferMinutes >= 150) {
    bufferScore = 100;
  } else if (airportSafetyBufferMinutes >= 120) {
    bufferScore = 90;
  } else if (airportSafetyBufferMinutes >= 90) {
    bufferScore = 75;
  } else if (airportSafetyBufferMinutes >= 60) {
    bufferScore = 50;
  } else {
    bufferScore = 20;
  }

  // 2. Exploration Margin Score (Weight 30%)
  // Ratio of planned activity vs net available exploration time
  const plannedTime = totalAttractionDurationMin || 0;
  const slackTime = actualExplorationMinutes - plannedTime;
  let marginScore = 100;

  if (slackTime < 0) {
    // Overbooked!
    marginScore = Math.max(10, 40 + (slackTime * 0.5));
  } else if (slackTime >= 45) {
    marginScore = 98; // generous 45+ min cushion
  } else if (slackTime >= 30) {
    marginScore = 90;
  } else if (slackTime >= 15) {
    marginScore = 78;
  } else {
    marginScore = 60; // Very tight schedule
  }

  // 3. Transit Reliability Score (Weight 20%)
  let transitScore = 95;
  const mode = (transportMode || 'metro').toLowerCase();
  if (mode === 'metro' || mode === 'train') {
    transitScore = 98; // Immune to road traffic
  } else if (mode === 'taxi' || mode === 'cab') {
    transitScore = 85; // Vulnerable to peak traffic
  } else if (mode === 'bus') {
    transitScore = 75; // Traffic + schedule wait times
  } else if (mode === 'walking') {
    transitScore = 95;
  } else {
    transitScore = 90;
  }

  // 4. Complexity & Hop Count Score (Weight 10%)
  let hopScore = 100;
  if (attractionCount <= 2) {
    hopScore = 98;
  } else if (attractionCount === 3) {
    hopScore = 85;
  } else if (attractionCount === 4) {
    hopScore = 70;
  } else {
    hopScore = 55; // 5+ stops is high risk for layovers
  }

  // 5. Weather & Baggage Modifiers (Weight 10%)
  let externalScore = 95;
  if (weatherCondition.toLowerCase().includes('rain') || weatherCondition.toLowerCase().includes('storm')) {
    externalScore -= 15;
  }
  if (hasCheckedLuggage) {
    externalScore -= 10;
  }
  externalScore = Math.max(30, externalScore);

  // Weighted Total Score
  const rawScore = (
    bufferScore * 0.30 +
    marginScore * 0.30 +
    transitScore * 0.20 +
    hopScore * 0.10 +
    externalScore * 0.10
  );

  const finalScore = Math.min(100, Math.max(10, Math.round(rawScore)));

  let level = 'LOW RISK';
  let badgeColor = 'green';
  let summary = 'Comfortable timeline with generous safety buffers. Low risk of delay.';

  if (finalScore < 60) {
    level = 'HIGH RISK';
    badgeColor = 'red';
    summary = 'Schedule is tightly packed with insufficient safety cushion. Any minor transit delay will risk your flight.';
  } else if (finalScore < 85) {
    level = 'MEDIUM RISK';
    badgeColor = 'yellow';
    summary = 'Feasible plan, but requires strict adherence to departure deadlines and punctual transit.';
  }

  const factors = [
    {
      name: 'Airport Return Buffer',
      score: bufferScore,
      weight: '30%',
      status: bufferScore >= 85 ? 'Optimal' : (bufferScore >= 60 ? 'Moderate' : 'Low'),
      detail: `${airportSafetyBufferMinutes} minutes safety buffer prior to flight departure.`
    },
    {
      name: 'Schedule Margin & Slack',
      score: marginScore,
      weight: '30%',
      status: marginScore >= 85 ? 'Safe Cushion' : (marginScore >= 60 ? 'Tight' : 'Overbooked'),
      detail: slackTime >= 0
        ? `${slackTime} minutes of flexible breathing room remaining.`
        : `Overbooked by ${Math.abs(slackTime)} minutes beyond usable exploration time.`
    },
    {
      name: 'Transport Mode Reliability',
      score: transitScore,
      weight: '20%',
      status: transitScore >= 90 ? 'High' : 'Moderate',
      detail: `${mode.toUpperCase()} transit selected (${transitScore}% reliability rating).`
    },
    {
      name: 'Stop Complexity & Hops',
      score: hopScore,
      weight: '10%',
      status: hopScore >= 85 ? 'Low Complexity' : 'Moderate Complexity',
      detail: `${attractionCount} stop(s) scheduled on this itinerary.`
    },
    {
      name: 'Luggage & Weather Factor',
      score: externalScore,
      weight: '10%',
      status: externalScore >= 80 ? 'Favorable' : 'Requires Attention',
      detail: `Weather: ${weatherCondition}; Checked Luggage: ${hasCheckedLuggage ? 'Yes' : 'No'}.`
    }
  ];

  return {
    score: finalScore,
    level,
    badgeColor,
    summary,
    factors
  };
};

module.exports = {
  calculateRiskScore
};
