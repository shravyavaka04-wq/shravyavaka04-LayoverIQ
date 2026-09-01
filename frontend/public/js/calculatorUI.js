/**
 * Layover Form and Calculator Visualizer
 */

class CalculatorUI {
  constructor() {
    this.airports = [];
    this.selectedInterests = new Set(['landmarks', 'food', 'photography']);
    this.currentCalculation = null;
  }

  async init() {
    try {
      const data = await LayoverAPI.getAirports();
      this.airports = data.airports || [];
      this.populateAirportDropdown();
      this.setDefaultDates();
      this.bindEvents();
    } catch (e) {
      console.warn('Could not fetch remote airports, using default list.');
    }
  }

  populateAirportDropdown() {
    const select = document.getElementById('airportSelect');
    if (!select) return;

    select.innerHTML = this.airports.map(a => `
      <option value="${a.code}">${a.code} — ${a.city} (${a.name})</option>
    `).join('');

    // Default to DXB (Dubai)
    select.value = 'DXB';
    this.updateAirportMetadata('DXB');
  }

  setDefaultDates() {
    const arrivalInput = document.getElementById('arrivalTimeInput');
    const departureInput = document.getElementById('departureTimeInput');
    if (!arrivalInput || !departureInput) return;

    const today = new Date();
    // Default arrival 10:00 AM
    const arrival = new Date(today);
    arrival.setHours(10, 0, 0, 0);

    // Default departure 6:30 PM (8.5h layover)
    const departure = new Date(today);
    departure.setHours(18, 30, 0, 0);

    arrivalInput.value = this.formatDateForInput(arrival);
    departureInput.value = this.formatDateForInput(departure);
  }

  formatDateForInput(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  bindEvents() {
    const form = document.getElementById('layoverForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        window.app.handleGenerateItinerary();
      });
    }

    const airportSelect = document.getElementById('airportSelect');
    if (airportSelect) {
      airportSelect.addEventListener('change', (e) => {
        this.updateAirportMetadata(e.target.value);
        window.app.handleCalculateOnly();
      });
    }

    const luggageToggle = document.getElementById('hasCheckedLuggageInput');
    if (luggageToggle) {
      luggageToggle.addEventListener('change', () => {
        window.app.handleCalculateOnly();
      });
    }

    const transportSelect = document.getElementById('transportModeSelect');
    if (transportSelect) {
      transportSelect.addEventListener('change', () => {
        window.app.handleCalculateOnly();
      });
    }

    // Input changes
    ['arrivalTimeInput', 'departureTimeInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', () => window.app.handleCalculateOnly());
    });
  }

  updateAirportMetadata(code) {
    const airport = this.airports.find(a => a.code === code);
    const noticeEl = document.getElementById('airportTransitNotice');
    if (noticeEl && airport) {
      noticeEl.innerHTML = `
        <div class="p-3 bg-blue-950/40 border border-blue-800/40 rounded-lg text-xs text-blue-200 flex items-start gap-2">
          <span class="text-base">🛂</span>
          <div>
            <span class="font-bold text-white">${airport.city} Transit Info:</span> ${airport.visaTransitNotice || 'Check transit visa eligibility before passing border control.'}
          </div>
        </div>
      `;
    }
  }

  toggleInterest(interestName) {
    const btn = document.getElementById(`interest_${interestName}`);
    if (this.selectedInterests.has(interestName)) {
      this.selectedInterests.delete(interestName);
      if (btn) btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-500');
      if (btn) btn.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
    } else {
      this.selectedInterests.add(interestName);
      if (btn) btn.classList.add('bg-blue-600', 'text-white', 'border-blue-500');
      if (btn) btn.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
    }
  }

  loadPreset(presetName) {
    const arrivalInput = document.getElementById('arrivalTimeInput');
    const departureInput = document.getElementById('departureTimeInput');
    const airportSelect = document.getElementById('airportSelect');
    const budgetInput = document.getElementById('budgetInput');
    const luggageToggle = document.getElementById('hasCheckedLuggageInput');
    const visaCheckbox = document.getElementById('visaCheckbox');

    const today = new Date();

    if (presetName === 'dubai_demo') {
      airportSelect.value = 'DXB';
      const arr = new Date(today); arr.setHours(10, 0, 0, 0);
      const dep = new Date(today); dep.setHours(18, 30, 0, 0);
      arrivalInput.value = this.formatDateForInput(arr);
      departureInput.value = this.formatDateForInput(dep);
      if (budgetInput) budgetInput.value = 3000;
      if (luggageToggle) luggageToggle.checked = false;
      if (visaCheckbox) visaCheckbox.checked = true;
      this.selectedInterests = new Set(['landmarks', 'food', 'photography']);
    } else if (presetName === 'singapore_demo') {
      airportSelect.value = 'SIN';
      const arr = new Date(today); arr.setHours(11, 0, 0, 0);
      const dep = new Date(today); dep.setHours(17, 0, 0, 0);
      arrivalInput.value = this.formatDateForInput(arr);
      departureInput.value = this.formatDateForInput(dep);
      if (budgetInput) budgetInput.value = 3500;
      if (visaCheckbox) visaCheckbox.checked = true;
      this.selectedInterests = new Set(['nature', 'landmarks', 'food']);
    } else if (presetName === 'london_demo') {
      airportSelect.value = 'LHR';
      const arr = new Date(today); arr.setHours(9, 30, 0, 0);
      const dep = new Date(today); dep.setHours(16, 30, 0, 0);
      arrivalInput.value = this.formatDateForInput(arr);
      departureInput.value = this.formatDateForInput(dep);
      if (budgetInput) budgetInput.value = 4000;
      if (visaCheckbox) visaCheckbox.checked = true;
      this.selectedInterests = new Set(['museums', 'culture', 'food']);
    } else if (presetName === 'delhi_demo') {
      airportSelect.value = 'DEL';
      const arr = new Date(today); arr.setHours(10, 0, 0, 0);
      const dep = new Date(today); dep.setHours(16, 0, 0, 0);
      arrivalInput.value = this.formatDateForInput(arr);
      departureInput.value = this.formatDateForInput(dep);
      if (budgetInput) budgetInput.value = 2500;
      if (visaCheckbox) visaCheckbox.checked = true;
      this.selectedInterests = new Set(['landmarks', 'food', 'culture']);
    }

    this.updateAirportMetadata(airportSelect.value);
    this.refreshInterestButtons();
    window.app.handleGenerateItinerary();
    window.app.showNotification(`Loaded ${presetName.replace('_', ' ').toUpperCase()} Scenario`, 'info');
  }

  refreshInterestButtons() {
    ['landmarks', 'food', 'shopping', 'museums', 'culture', 'nature', 'photography', 'relaxation', 'adventure'].forEach(name => {
      const btn = document.getElementById(`interest_${name}`);
      if (btn) {
        if (this.selectedInterests.has(name)) {
          btn.classList.add('bg-blue-600', 'text-white', 'border-blue-500');
          btn.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
        } else {
          btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-500');
          btn.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
        }
      }
    });
  }

  renderCalculationBreakdown(calcData) {
    this.currentCalculation = calcData;
    const container = document.getElementById('calculatorBreakdownContainer');
    if (!container) return;

    const { breakdownMinutes, formatted, isViableForCityExploration } = calcData;

    container.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <!-- Total Layover -->
        <div class="glass-card p-3.5 border-slate-700/60 bg-slate-900/60 text-center">
          <p class="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Layover</p>
          <p class="text-xl font-bold text-white mt-1">${formatted.totalLayover}</p>
          <span class="text-[10px] text-slate-500">${calcData.formatted.arrivalTimeFormatted} → ${calcData.formatted.departureTimeFormatted}</span>
        </div>

        <!-- Airport Processing -->
        <div class="glass-card p-3.5 border-slate-700/60 bg-slate-900/60 text-center">
          <p class="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Airport Processing</p>
          <p class="text-xl font-bold text-amber-400 mt-1">-${formatted.airportProcessing}</p>
          <span class="text-[10px] text-slate-500">Immigration & Exit</span>
        </div>

        <!-- Transportation Time -->
        <div class="glass-card p-3.5 border-slate-700/60 bg-slate-900/60 text-center">
          <p class="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Transit to City</p>
          <p class="text-xl font-bold text-blue-400 mt-1">-${formatted.transitTime}</p>
          <span class="text-[10px] text-slate-500">Roundtrip Transit</span>
        </div>

        <!-- Recommended Return Buffer -->
        <div class="glass-card p-3.5 border-slate-700/60 bg-slate-900/60 text-center">
          <p class="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Airport Buffer</p>
          <p class="text-xl font-bold text-purple-400 mt-1">-${formatted.airportSafetyBuffer}</p>
          <span class="text-[10px] text-slate-500">Security & Gate</span>
        </div>

        <!-- Actual Usable Exploration Time -->
        <div class="glass-card p-3.5 border-2 ${isViableForCityExploration ? 'border-emerald-500/50 bg-emerald-950/30' : 'border-red-500/50 bg-red-950/30'} col-span-2 md:col-span-1 text-center shadow-lg">
          <p class="text-[11px] ${isViableForCityExploration ? 'text-emerald-300' : 'text-red-300'} font-bold uppercase tracking-wider">Usable Exploration</p>
          <p class="text-2xl font-extrabold ${isViableForCityExploration ? 'text-emerald-400' : 'text-red-400'} mt-1">${formatted.actualExplorationTime}</p>
          <span class="text-[10px] ${isViableForCityExploration ? 'text-emerald-200/70' : 'text-red-200/70'}">City Exploration Window</span>
        </div>
      </div>

      <!-- Critical Deadlines Ribbon -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/80 border border-slate-700/70 rounded-xl text-xs">
        <div class="flex items-center gap-2">
          <span class="text-blue-400 font-bold">🏙️ City Arrival:</span>
          <span class="text-white font-semibold">${calcData.formatted.arrivalTimeFormatted} + ${calcData.breakdownMinutes.totalAirportProcessingMinutes + calcData.breakdownMinutes.travelToCityMinutes}m</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-amber-400 font-bold">🚨 MUST Leave City by:</span>
          <span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded border border-amber-500/40">${formatted.latestCityDepartureFormatted}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-emerald-400 font-bold">✈️ Return to Airport:</span>
          <span class="text-white font-semibold">${formatted.recommendedReturnFormatted}</span>
        </div>
      </div>
    `;
  }
}

window.CalculatorUI = CalculatorUI;
