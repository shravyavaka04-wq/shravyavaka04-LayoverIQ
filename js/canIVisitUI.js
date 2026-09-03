/**
 * "Can I Actually Visit This?" UI Manager
 */

class CanIVisitUI {
  constructor() {
    this.currentAttractions = [];
  }

  async openModal(selectedAttractionId = null) {
    const modal = document.getElementById('canIVisitModal');
    if (!modal) return;

    modal.classList.remove('hidden');

    const airportCode = document.getElementById('airportSelect')?.value || 'DXB';
    const attrSelect = document.getElementById('canIVisitAttractionSelect');

    try {
      const data = await LayoverAPI.getAttractions(airportCode);
      this.currentAttractions = data.attractions || [];

      if (attrSelect) {
        attrSelect.innerHTML = this.currentAttractions.map(a => `
          <option value="${a.id}" ${a.id === selectedAttractionId ? 'selected' : ''}>${a.name} (${a.durationMin}m visit, ₹${a.costINR})</option>
        `).join('');
      }

      this.evaluateCurrentSelection();
    } catch (e) {
      console.error(e);
    }
  }

  closeModal() {
    const modal = document.getElementById('canIVisitModal');
    if (modal) modal.classList.add('hidden');
  }

  checkSpecific(attractionId) {
    this.openModal(attractionId);
  }

  async evaluateCurrentSelection() {
    const attractionId = document.getElementById('canIVisitAttractionSelect')?.value;
    const transportMode = document.getElementById('canIVisitTransportSelect')?.value || 'metro';
    const resultContainer = document.getElementById('canIVisitResultContainer');

    const base = window.app.getCurrentSearchParams();

    try {
      const res = await LayoverAPI.canIVisit({
        airportCode: base.airportCode,
        attractionId,
        arrivalTime: base.arrivalTime,
        departureTime: base.departureTime,
        transportMode
      });

      this.renderEvaluation(res, resultContainer);
    } catch (err) {
      if (resultContainer) {
        resultContainer.innerHTML = `<p class="text-xs text-red-400">Evaluation error: ${err.message}</p>`;
      }
    }
  }

  renderEvaluation(data, container) {
    if (!container) return;

    const { attraction, status, verdictTitle, badgeColor, advice, calculation, timelinePreview } = data;

    let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    let cardBorder = 'border-emerald-500/50 bg-emerald-950/20';

    if (status === 'NOT_RECOMMENDED') {
      badgeClass = 'bg-red-500/20 text-red-300 border-red-500/40';
      cardBorder = 'border-red-500/50 bg-red-950/20';
    } else if (status === 'RISKY') {
      badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      cardBorder = 'border-amber-500/50 bg-amber-950/20';
    }

    container.innerHTML = `
      <div class="glass-card p-5 border-2 ${cardBorder} mt-4 rounded-xl">
        <div class="flex items-center justify-between gap-2 mb-3">
          <div>
            <h4 class="text-base font-bold text-white">${attraction.name}</h4>
            <p class="text-xs text-slate-400">${attraction.description || ''}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-black uppercase border ${badgeClass}">
            ${verdictTitle}
          </span>
        </div>

        <p class="text-xs font-semibold text-slate-200 mb-4">${advice}</p>

        <!-- Calculation Proof Table -->
        <div class="bg-slate-900/90 border border-slate-700/60 rounded-xl p-3.5 space-y-2 text-xs">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mathematical Calculation Proof</p>
          
          <div class="flex justify-between text-slate-300">
            <span>🚗 Travel from Airport:</span>
            <span class="font-bold text-white">${calculation.travelFromAirportFormatted}</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>⏱️ Recommended Visit Duration:</span>
            <span class="font-bold text-white">${calculation.recommendedVisitDurationFormatted}</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>🚗 Return Journey to Airport:</span>
            <span class="font-bold text-white">${calculation.returnJourneyFormatted}</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>🛡️ Mandatory Airport Safety Buffer:</span>
            <span class="font-bold text-white">${calculation.airportSafetyBufferFormatted}</span>
          </div>
          
          <div class="pt-2 border-t border-slate-700 flex justify-between font-bold">
            <span class="text-blue-400">Total Required Layover Time:</span>
            <span class="text-white">${calculation.totalRequiredFormatted}</span>
          </div>
          <div class="flex justify-between font-bold">
            <span class="text-slate-400">Your Available Total Layover:</span>
            <span class="text-white">${calculation.totalAvailableFormatted}</span>
          </div>
          <div class="flex justify-between font-bold">
            <span class="${calculation.actualBufferBeforeFlightMin >= 120 ? 'text-emerald-400' : 'text-amber-400'}">Resulting Airport Buffer:</span>
            <span class="${calculation.actualBufferBeforeFlightMin >= 120 ? 'text-emerald-400' : 'text-amber-400'}">${calculation.actualBufferFormatted}</span>
          </div>
        </div>

        <!-- Timeline preview -->
        <div class="mt-3.5 p-3 bg-slate-900/60 rounded-lg flex items-center justify-between text-[11px] text-slate-400">
          <div><span class="font-semibold text-white">🛬 Land:</span> ${timelinePreview.flightLanding}</div>
          <div><span class="font-semibold text-white">🏛️ At Sight:</span> ${timelinePreview.arriveAtAttraction}</div>
          <div><span class="font-semibold text-white">🚗 Leave:</span> ${timelinePreview.leaveAttraction}</div>
          <div><span class="font-semibold text-white">✈️ Depart:</span> ${timelinePreview.flightDeparture}</div>
        </div>
      </div>
    `;
  }
}

window.CanIVisitUI = CanIVisitUI;
