/**
 * Itinerary Timeline and Risk Score Visualizer
 */

class ItineraryUI {
  constructor() {
    this.currentItinerary = null;
  }

  renderItinerary(itineraryData) {
    this.currentItinerary = itineraryData;
    const timelineContainer = document.getElementById('itineraryTimelineContainer');
    const riskContainer = document.getElementById('riskScoreContainer');
    const weatherNoticeContainer = document.getElementById('weatherNoticeContainer');

    if (!timelineContainer) return;

    // 1. Weather Notice Banner
    if (weatherNoticeContainer) {
      if (itineraryData.weatherNotice) {
        weatherNoticeContainer.innerHTML = `
          <div class="p-3.5 bg-blue-950/60 border border-blue-600/50 rounded-xl mb-4 text-xs text-blue-200 flex items-center justify-between gap-3 shadow-md animate-fade-in">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">🌧️</span>
              <div>
                <p class="font-bold text-white text-sm">${itineraryData.weatherNotice.badge}</p>
                <p class="text-slate-300 mt-0.5">${itineraryData.weatherNotice.message}</p>
              </div>
            </div>
            <span class="px-2.5 py-1 bg-blue-600 text-white font-semibold rounded text-[10px] uppercase">Auto-Adapted</span>
          </div>
        `;
      } else {
        weatherNoticeContainer.innerHTML = '';
      }
    }

    // 2. Risk Score Visualization
    if (riskContainer && itineraryData.riskScore) {
      const risk = itineraryData.riskScore;
      const score = risk.score;
      const circumference = 2 * Math.PI * 40; // r=40
      const strokeDashoffset = circumference - (score / 100) * circumference;

      let colorClass = 'text-emerald-400 stroke-emerald-400';
      let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      if (score < 60) {
        colorClass = 'text-red-400 stroke-red-400';
        badgeBg = 'bg-red-500/20 text-red-300 border-red-500/40';
      } else if (score < 85) {
        colorClass = 'text-amber-400 stroke-amber-400';
        badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      }

      riskContainer.innerHTML = `
        <div class="glass-card p-5 border-slate-700/80">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <!-- Circular Gauge -->
            <div class="flex items-center gap-4">
              <div class="relative w-24 h-24 flex items-center justify-center">
                <svg class="w-24 h-24 risk-meter-ring" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" class="stroke-slate-800" stroke-width="8" fill="transparent"></circle>
                  <circle cx="50" cy="50" r="40" class="${colorClass}" stroke-width="8" fill="transparent"
                    stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round"></circle>
                </svg>
                <div class="absolute text-center">
                  <span class="text-2xl font-black text-white">${score}</span>
                  <span class="text-[10px] text-slate-400 block -mt-1">/ 100</span>
                </div>
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-base font-bold text-white">Flight Safety Risk Score</h4>
                  <span class="px-2.5 py-0.5 text-xs font-extrabold rounded-full border ${badgeBg}">${risk.level}</span>
                </div>
                <p class="text-xs text-slate-300 mt-1 max-w-md">${risk.summary}</p>
              </div>
            </div>

            <!-- Risk Factor Tags -->
            <div class="flex flex-wrap gap-2 sm:justify-end">
              ${risk.factors.map(f => `
                <div class="px-2.5 py-1 bg-slate-900/80 border border-slate-700/60 rounded text-[11px] text-slate-300" title="${f.detail}">
                  <span class="font-bold text-white">${f.name}:</span>
                  <span class="${f.score >= 80 ? 'text-emerald-400' : (f.score >= 60 ? 'text-amber-400' : 'text-red-400')} font-semibold">${f.score}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // 3. Render Timeline Items
    const timeline = itineraryData.timeline || [];
    let timelineHTML = `<div class="timeline-track space-y-4 relative py-2">`;

    timeline.forEach((step, idx) => {
      let dotTypeClass = 'safe';
      let cardBorder = 'border-slate-700/60';
      let bgStyle = 'bg-slate-900/70';

      if (step.criticalDeadline) {
        dotTypeClass = 'danger';
        cardBorder = 'border-amber-500/60';
        bgStyle = 'bg-amber-950/20';
      } else if (step.type === 'airport_buffer') {
        dotTypeClass = 'buffer';
        cardBorder = 'border-purple-500/50';
        bgStyle = 'bg-purple-950/20';
      }

      timelineHTML += `
        <div class="timeline-node">
          <div class="timeline-dot ${dotTypeClass}">
            <span class="text-[10px] text-white font-bold">${idx + 1}</span>
          </div>

          <div class="glass-card p-4 border ${cardBorder} ${bgStyle}">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 text-[11px] font-bold rounded bg-slate-800 text-blue-300 border border-blue-500/30">
                  ${step.time} ${step.endTime ? `– ${step.endTime}` : ''}
                </span>
                <span class="text-xs text-slate-400 font-medium">(${step.durationMin} mins)</span>
              </div>
              <span class="px-2 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                ${step.badge || step.type}
              </span>
            </div>

            <h4 class="text-base font-bold text-white">${step.title}</h4>
            <p class="text-xs text-slate-300 mt-1">${step.description}</p>

            ${step.whySelected ? `
              <div class="mt-2.5 p-2.5 bg-blue-950/40 border border-blue-800/40 rounded-lg text-xs text-blue-200">
                <span class="font-bold text-blue-300">💡 Why LayoverIQ picked this:</span> ${step.whySelected}
              </div>
            ` : ''}

            ${step.type === 'attraction' ? `
              <div class="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                <div class="flex items-center gap-3">
                  <span class="text-emerald-400 font-semibold">🎟️ Entry: ₹${step.costINR}</span>
                  <span class="text-slate-400">⏱️ Est. Visit: ${step.durationMin}m</span>
                  ${step.isIndoor ? '<span class="text-cyan-300">🏛️ Indoor/AC</span>' : '<span class="text-amber-300">☀️ Outdoor</span>'}
                </div>
                <div class="flex items-center gap-2">
                  <button onclick="window.simulatorUI.quickSimulate('${step.id.replace('step_attr_', '')}', 30)" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] border border-slate-700 transition">
                    +30m What-If?
                  </button>
                  <button onclick="window.canIVisitUI.checkSpecific('${step.id.replace('step_attr_', '')}')" class="px-2 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded text-[11px] transition">
                    🔍 Can I Visit?
                  </button>
                </div>
              </div>
            ` : ''}

            ${step.criticalDeadline ? `
              <div class="mt-2.5 p-2.5 bg-red-950/60 border border-red-600/60 rounded-lg text-xs text-red-200 font-semibold flex items-center gap-2">
                <span class="text-lg">⚠️</span>
                <span>CRITICAL DEADLINE: Missing this departure time directly risks missing your flight!</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });

    timelineHTML += `</div>`;
    timelineContainer.innerHTML = timelineHTML;
  }
}

window.ItineraryUI = ItineraryUI;
