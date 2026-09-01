const { calculateLayoverTimes, formatDuration } = require('./layoverCalculator');
const { generateItinerary } = require('./itineraryGenerator');
const { evaluateCanIVisit } = require('./canIVisitEngine');
const { optimizeEmergencyDelay } = require('./emergencyOptimizer');
const { getAirportByCode, airports } = require('../data/airports');
const { attractions } = require('../data/attractions');

/**
 * Intelligent Rule-Based Local AI Intent Processor (Zero-API Dependency)
 */
const processLocalAIQuery = (query, context = {}) => {
  const q = (query || '').toLowerCase();
  const airportCode = context.airportCode || 'DXB';
  const airport = getAirportByCode(airportCode) || airports[0];

  // 1. Check for "Running Late" Intent
  if (q.includes('running late') || q.includes('behind schedule') || q.includes('delayed') || q.includes('late')) {
    const minuteMatch = q.match(/(\d+)\s*(min|minute|minutes|m)/);
    const delayMin = minuteMatch ? parseInt(minuteMatch[1], 10) : 30;
    const emergencyPlan = optimizeEmergencyDelay({
      delayMinutes: delayMin,
      airportCode,
      arrivalTime: context.arrivalTime,
      departureTime: context.departureTime
    });

    return {
      reply: `🚨 **LayoverIQ Emergency Advisor Alert:**\n\nYou are running **${delayMin} minutes behind schedule**.\n\n` +
             `**Immediate Action Plan:**\n` +
             `1. 🚕 **Switch to Express Taxi/Cab**: Do not wait for scheduled public buses or multi-transfer trains.\n` +
             `2. 🛑 **Skip Secondary Stops**: Drop any shopping, dessert stops, or distant sights immediately.\n` +
             `3. ⏰ **Latest Safe Departure**: You must leave your current location by **${emergencyPlan.deadlines.latestCityDepartureFormatted}**.\n` +
             `4. 📞 **Airport Support**: ${emergencyPlan.airportContacts.airportPolice} (Airport Emergency Desk).\n\n` +
             `*Head directly to ${airport.name} terminal departures now.*`,
      intent: 'emergency_delay',
      data: emergencyPlan
    };
  }

  // 2. Check for "Can I visit [attraction]?" Intent
  if (q.includes('can i visit') || q.includes('can i see') || q.includes('possible to visit') || q.includes('enough time for')) {
    // Find matching attraction name
    const foundAttr = attractions.find(a => q.includes(a.name.toLowerCase()) || q.includes(a.id.toLowerCase()) || q.includes(a.categories.some(c => q.includes(c))));
    const attrToEval = foundAttr || attractions[0];

    const canVisit = evaluateCanIVisit({
      airportCode: attrToEval.airportCode || airportCode,
      attractionId: attrToEval.id,
      arrivalTime: context.arrivalTime,
      departureTime: context.departureTime,
      transportMode: context.preferredTransport || 'metro'
    });

    return {
      reply: `🔍 **LayoverIQ Feasibility Evaluation for ${attrToEval.name}:**\n\n` +
             `Verdict: **${canVisit.verdictTitle}**\n\n` +
             `📊 **Calculation Breakdown:**\n` +
             `• Transit from Airport: **${canVisit.calculation.travelFromAirportFormatted}**\n` +
             `• Recommended Visit: **${canVisit.calculation.recommendedVisitDurationFormatted}**\n` +
             `• Return Journey to Airport: **${canVisit.calculation.returnJourneyFormatted}**\n` +
             `• Airport Security Safety Buffer: **${canVisit.calculation.airportSafetyBufferFormatted}**\n` +
             `• Flight Departure: **${canVisit.timelinePreview.flightDeparture}**\n\n` +
             `💡 **Recommendation:** ${canVisit.advice}`,
      intent: 'can_i_visit',
      data: canVisit
    };
  }

  // 3. Check for "Hours in City + Preference" Intent (e.g. "I have 5 hours in Dubai and I love food")
  const hourMatch = q.match(/(\d+)\s*(hour|hours|hr|hrs|h)/);
  if (hourMatch || q.includes('plan') || q.includes('itinerary') || q.includes('recommend') || q.includes('relax')) {
    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 6;
    const isRelaxed = q.includes('relax') || q.includes('chill') || q.includes('easy');
    const isFood = q.includes('food') || q.includes('eat') || q.includes('dining') || q.includes('cuisine');

    const interests = [];
    if (isFood) interests.push('food');
    if (q.includes('shopping')) interests.push('shopping');
    if (q.includes('museum') || q.includes('art')) interests.push('museums');
    if (q.includes('photo') || q.includes('photography')) interests.push('photography');
    if (interests.length === 0) interests.push('landmarks', 'culture');

    const now = new Date();
    const arrival = new Date(now.getTime());
    const departure = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const generated = generateItinerary({
      airportCode,
      arrivalTime: arrival,
      departureTime: departure,
      interests,
      preferredTransport: isRelaxed ? 'taxi' : 'metro'
    });

    const stopsText = generated.selectedAttractions.map((a, i) => `  ${i + 1}. **${a.name}** (~${a.durationMin} min)`).join('\n');

    return {
      reply: `✨ **Personalized Layover Plan for ${airport.city} (${hours} Hours Available):**\n\n` +
             `⏱️ **Usable Exploration Window:** ${generated.layoverCalculation.formatted.actualExplorationTime}\n` +
             `🛡️ **Safety Return Buffer:** ${generated.layoverCalculation.formatted.airportSafetyBuffer}\n` +
             `🚦 **Risk Score:** **${generated.riskScore.score}/100 (${generated.riskScore.level})**\n\n` +
             `📍 **Recommended Stops:**\n${stopsText || '  1. Airport Transit Jewel/Lounge (Short connection safe plan)'}\n\n` +
             `🚨 **Critical Return Deadline:** You MUST depart the city by **${generated.layoverCalculation.formatted.latestCityDepartureFormatted}** to arrive safely at the airport by **${generated.layoverCalculation.formatted.recommendedReturnFormatted}**.\n\n` +
             `Would you like me to simulate what happens if you spend extra time at any of these locations?`,
      intent: 'generate_plan',
      data: generated
    };
  }

  // 4. Visa & Transit Warning queries
  if (q.includes('visa') || q.includes('entry') || q.includes('passport') || q.includes('transit requirements')) {
    return {
      reply: `🛂 **LayoverIQ Transit & Immigration Advisory for ${airport.name} (${airport.code}):**\n\n` +
             `• **Airport Policy:** ${airport.visaTransitNotice || 'Leaving airport during a layover requires standard border clearance.'}\n` +
             `• **Processing Buffer:** Allow **${airport.processingTimes.averageImmigrationMin} minutes** for inbound immigration and **${airport.safetyBuffers.internationalReturnBufferMin} minutes** return buffer for security.\n` +
             `• **Legal Notice:** Always verify passport nationality eligibility and transit visa rules with official immigration before passing through border control!`,
      intent: 'visa_info'
    };
  }

  // Default Assistant Response
  return {
    reply: `👋 Hello! I am your **LayoverIQ Intelligent Assistant**.\n\n` +
           `I specialize in flight-safety itinerary planning. You can ask me:\n` +
           `• *"I have 6 hours in Dubai and want local food."*\n` +
           `• *"Can I visit Burj Khalifa during my 4-hour layover?"*\n` +
           `• *"I am running 25 minutes late, what should I do?"*\n` +
           `• *"Give me a relaxed 5-hour plan for Singapore Changi."*\n\n` +
           `What is your transit airport and how much time do you have?`,
    intent: 'general_help'
  };
};

/**
 * AI Assistant Chat Dispatcher
 */
const handleAIChat = async (message, context = {}) => {
  // If external AI API Key is configured, we could call it here.
  // Otherwise, our comprehensive local NLP Intent processor handles all scenarios with zero lag.
  return processLocalAIQuery(message, context);
};

module.exports = {
  handleAIChat,
  processLocalAIQuery
};
