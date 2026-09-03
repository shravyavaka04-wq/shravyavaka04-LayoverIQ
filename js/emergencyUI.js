/**
 * "🚨 I'M RUNNING LATE" Emergency UI Controller
 */

class EmergencyUI {
  constructor() {
    this.currentDelay = 35;
  }

  openEmergencyModal() {
    const modal = document.getElementById('emergencyModal');
    if (!modal) return;

    modal.classList.remove('hidden');
    this.triggerEmergencyReroute();
  }

  closeEmergencyModal() {
    const modal = document.getElementById('emergencyModal');
    if (modal) modal.classList.add('hidden');
  }

  async triggerEmergencyReroute() {
    const slider = document.getElementById('emergencyDelaySlider');
    const delayMinutes = Number(slider?.value || this.currentDelay);
    const resultContainer = document.getElementById('emergencyResultsContainer');

    const base = window.app.getCurrentSearchParams();

    try {
      const data = await LayoverAPI.emergencyRunningLate({
        delayMinutes,
        airportCode: base.airportCode,
        arrivalTime: base.arrivalTime,
        departureTime: base.departureTime,
        hasCheckedLuggage: base.hasCheckedLuggage
      });

      this.renderEmergencyPlan(data, resultContainer);
    } catch (err) {
      if (resultContainer) {
        resultContainer.innerHTML = `<p class="text-xs text-red-400">Emergency protocol error: ${err.message}</p>`;
      }
    }
  }

  renderEmergencyPlan(data, container) {
    if (!container) return;

    const { alertHeadline, actionSummary, fastestTransit, deadlines, actionsTaken, emergencySteps, airportContacts } = data;

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Emergency Headline Banner -->
        <div class="p-4 rounded-xl emergency-pulse text-white shadow-lg">
          <div class="flex items-center justify-between">
            <h4 class="text-base font-extrabold flex items-center gap-2">
              <span>🚨</span> ${alertHeadline}
            </h4>
            <span class="px-2.5 py-1 bg-black/40 text-red-200 text-xs font-black rounded uppercase">Active Override</span>
          </div>
          <p class="text-xs text-red-100 mt-2 font-medium leading-relaxed">${actionSummary}</p>
        </div>

        <!-- Latest Safe Departure Card -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div class="p-3 bg-slate-900 border border-slate-700 rounded-xl">
            <p class="text-[10px] text-slate-400 font-bold uppercase">Fastest Transport</p>
            <p class="text-sm font-bold text-amber-400 mt-1">${fastestTransit.mode}</p>
            <p class="text-[10px] text-slate-500">~${fastestTransit.durationFormatted} (₹${fastestTransit.estimatedCostINR})</p>
          </div>

          <div class="p-3 bg-red-950/60 border border-red-500 rounded-xl shadow">
            <p class="text-[10px] text-red-300 font-bold uppercase">MUST Leave City By</p>
            <p class="text-lg font-black text-white mt-1">${deadlines.latestCityDepartureFormatted}</p>
            <p class="text-[10px] text-red-300">Absolute Last Safe Time</p>
          </div>

          <div class="p-3 bg-slate-900 border border-slate-700 rounded-xl">
            <p class="text-[10px] text-slate-400 font-bold uppercase">Flight Takeoff</p>
            <p class="text-sm font-bold text-white mt-1">${deadlines.flightDepartureFormatted}</p>
            <p class="text-[10px] text-slate-500">Gates close 25m prior</p>
          </div>
        </div>

        <!-- Recovery Action Steps -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <h5 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Required Corrective Actions</h5>
          
          <div class="space-y-2">
            ${actionsTaken.map(a => `
              <div class="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg flex items-start gap-2.5 text-xs">
                <span class="px-2 py-0.5 bg-red-500/20 text-red-300 font-bold rounded text-[10px] uppercase shrink-0">Step ${a.priority}</span>
                <div>
                  <p class="font-bold text-white">${a.action}</p>
                  <p class="text-slate-300 mt-0.5">${a.instruction}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Emergency Steps Timeline -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <h5 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Evacuation Timeline</h5>
          <div class="space-y-2 text-xs">
            ${emergencySteps.map(s => `
              <div class="flex items-center justify-between p-2 bg-slate-800/40 rounded border border-slate-700/40">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-blue-400">${s.title}:</span>
                  <span class="text-slate-300">${s.instruction}</span>
                </div>
                <span class="px-2 py-0.5 bg-slate-900 text-amber-300 font-mono font-bold rounded text-[10px]">${s.time}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Emergency Contacts Box -->
        <div class="p-3 bg-blue-950/40 border border-blue-700/40 rounded-xl flex items-center justify-between text-xs">
          <div class="flex items-center gap-2 text-blue-200">
            <span class="text-lg">📞</span>
            <span>Airport Emergency: <strong class="text-white">${airportContacts.airportPolice || '112'}</strong></span>
          </div>
          <a href="tel:${airportContacts.airportPolice || '112'}" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs transition">
            Call Desk
          </a>
        </div>
      </div>
    `;
  }
}

window.EmergencyUI = EmergencyUI;
