/**
 * "What If?" Dynamic Layover Simulator UI Controller
 */

class SimulatorUI {
  constructor() {
    this.currentSimulation = null;
  }

  async runSimulation() {
    const extraDuration = Number(document.getElementById('simExtraDurationSlider')?.value || 0);
    const transportMode = document.getElementById('simTransportSelect')?.value || 'metro';
    const departureOffset = Number(document.getElementById('simDepartureOffsetSlider')?.value || 0);

    const baseParams = window.app.getCurrentSearchParams();

    try {
      const result = await LayoverAPI.simulateWhatIf({
        baseParams,
        perturbations: {
          extraDurationMinutes: extraDuration,
          newTransportMode: transportMode,
          departureOffsetMinutes: departureOffset
        }
      });

      this.currentSimulation = result;
      this.renderSimulationResults(result);
    } catch (err) {
      window.app.showNotification(`Simulation error: ${err.message}`, 'error');
    }
  }

  quickSimulate(attractionId, extraMin) {
    const slider = document.getElementById('simExtraDurationSlider');
    const label = document.getElementById('simExtraDurationValue');
    if (slider) slider.value = extraMin;
    if (label) label.innerText = `+${extraMin} mins`;

    window.app.switchTab('simulatorTab');
    this.runSimulation();
  }

  renderSimulationResults(sim) {
    const container = document.getElementById('simulatorResultsContainer');
    if (!container) return;

    const { original, simulated, comparison, isStillSafe } = sim;

    container.innerHTML = `
      <div class="glass-card p-5 border-2 ${isStillSafe ? (simulated.riskLevel === 'LOW RISK' ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-amber-500/50 bg-amber-950/20') : 'border-red-500/70 bg-red-950/40'}">
        <div class="flex items-center justify-between gap-2 mb-4">
          <h4 class="text-base font-bold text-white flex items-center gap-2">
            <span>🔮 Simulation Verdict:</span>
            <span class="px-2.5 py-0.5 rounded text-xs font-black uppercase ${isStillSafe ? (simulated.riskLevel === 'LOW RISK' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300') : 'bg-red-500/30 text-red-300'}">
              ${simulated.riskLevel}
            </span>
          </h4>
          <span class="text-xs font-bold ${comparison.scoreDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}">
            Risk Delta: ${comparison.scoreDeltaFormatted}
          </span>
        </div>

        <p class="text-sm font-semibold text-slate-200 mb-4">${comparison.verdictExplanation}</p>

        <!-- Side by Side Comparison Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <!-- Original Plan -->
          <div class="p-3.5 bg-slate-900/80 border border-slate-700/60 rounded-xl">
            <p class="text-[11px] font-bold text-slate-400 uppercase mb-2">Original Baseline Plan</p>
            <div class="space-y-1.5">
              <div class="flex justify-between"><span class="text-slate-400">Risk Score:</span> <span class="font-bold text-white">${original.riskScore}/100 (${original.riskLevel})</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Airport Return Buffer:</span> <span class="font-bold text-white">${original.bufferFormatted}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Planned Stops:</span> <span class="font-bold text-white">${original.attractionsCount} stops</span></div>
            </div>
          </div>

          <!-- Simulated Plan -->
          <div class="p-3.5 ${isStillSafe ? 'bg-blue-950/40 border-blue-600/40' : 'bg-red-950/40 border-red-600/40'} border rounded-xl">
            <p class="text-[11px] font-bold ${isStillSafe ? 'text-blue-300' : 'text-red-300'} uppercase mb-2">Simulated Outcome</p>
            <div class="space-y-1.5">
              <div class="flex justify-between"><span class="text-slate-400">New Risk Score:</span> <span class="font-bold ${simulated.riskScore >= 85 ? 'text-emerald-400' : (simulated.riskScore >= 60 ? 'text-amber-400' : 'text-red-400')}">${simulated.riskScore}/100</span></div>
              <div class="flex justify-between"><span class="text-slate-400">New Return Buffer:</span> <span class="font-bold text-white">${simulated.bufferFormatted}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Buffer Change:</span> <span class="font-bold ${comparison.bufferDeltaMinutes >= 0 ? 'text-emerald-400' : 'text-red-400'}">${comparison.bufferDeltaMinutes} mins</span></div>
            </div>
          </div>
        </div>

        ${comparison.appliedChanges.length > 0 ? `
          <div class="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <span class="font-bold text-slate-400">Active Perturbations:</span>
            <ul class="list-disc list-inside mt-1 space-y-0.5 text-slate-300">
              ${comparison.appliedChanges.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }
}

window.SimulatorUI = SimulatorUI;
