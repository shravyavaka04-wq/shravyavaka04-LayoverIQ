/**
 * LayoverIQ — Main Application Orchestrator
 * "Smart decisions between flights."
 */

class LayoverIQApp {
  constructor() {
    this.currentItinerary = null;
    this.activeTab = 'optimizerTab';
  }

  async init() {
    // Initialize UI Subsystems
    window.authManager = new AuthManager();
    window.calculatorUI = new CalculatorUI();
    window.itineraryUI = new ItineraryUI();
    window.simulatorUI = new SimulatorUI();
    window.canIVisitUI = new CanIVisitUI();
    window.emergencyUI = new EmergencyUI();
    window.mapUI = new MapUI();
    window.aiChatUI = new AIChatUI();
    window.budgetWeatherUI = new BudgetWeatherUI();
    window.offlineExportManager = new OfflineExportManager();

    await window.calculatorUI.init();
    window.mapUI.initMap();
    window.aiChatUI.init();

    // Generate initial default plan (Dubai 8.5h demo layover)
    await this.handleGenerateItinerary();
  }

  getCurrentSearchParams() {
    const airportCode = document.getElementById('airportSelect')?.value || 'DXB';
    const arrivalTime = document.getElementById('arrivalTimeInput')?.value;
    const departureTime = document.getElementById('departureTimeInput')?.value;
    const budget = Number(document.getElementById('budgetInput')?.value || 3000);
    const transport = document.getElementById('transportModeSelect')?.value || 'metro';
    const travelers = Number(document.getElementById('travelersCountSelect')?.value || 1);
    const luggage = document.getElementById('hasCheckedLuggageInput')?.checked || false;
    const isNewHere = this.activeTab === 'newHereTab';

    return {
      airportCode,
      arrivalTime,
      departureTime,
      budget,
      interests: Array.from(window.calculatorUI.selectedInterests),
      preferredTransport: transport,
      travelers,
      hasCheckedLuggage: luggage,
      isInternationalFlight: true,
      isNewHere
    };
  }

  async handleCalculateOnly() {
    const params = this.getCurrentSearchParams();
    try {
      const calcData = await LayoverAPI.calculateLayover(params);
      window.calculatorUI.renderCalculationBreakdown(calcData);
      window.budgetWeatherUI.updateWeather(params.airportCode);
    } catch (e) {
      console.warn('Live calculation error:', e);
    }
  }

  async handleGenerateItinerary() {
    const visaChecked = document.getElementById('visaCheckbox')?.checked;
    if (!visaChecked) {
      this.showNotification('Please acknowledge the transit visa & airport exit disclaimer before proceeding.', 'warning');
      document.getElementById('visaCheckboxContainer')?.classList.add('ring-2', 'ring-amber-500');
      return;
    }

    this.setLoading(true);
    const params = this.getCurrentSearchParams();

    try {
      const itinerary = await LayoverAPI.generateItinerary(params);
      this.currentItinerary = itinerary;

      // Update Subsystems
      window.calculatorUI.renderCalculationBreakdown(itinerary.layoverCalculation);
      window.itineraryUI.renderItinerary(itinerary);
      window.budgetWeatherUI.renderBudget(itinerary.budgetBreakdown);
      window.budgetWeatherUI.updateWeather(params.airportCode);
      window.mapUI.updateMap(itinerary);
      window.offlineExportManager.saveToOffline(itinerary);

      this.setLoading(false);
      this.showNotification(`Generated optimal itinerary for ${itinerary.airport?.city || 'Layover'}!`, 'success');
    } catch (err) {
      this.setLoading(false);
      this.showNotification(`Error generating itinerary: ${err.message}`, 'error');
    }
  }

  async saveCurrentTrip() {
    if (!this.currentItinerary) {
      this.showNotification('No active itinerary to save.', 'warning');
      return;
    }

    const payload = {
      title: `${this.currentItinerary.airport.city} (${this.currentItinerary.airport.code}) Layover Plan`,
      airportCode: this.currentItinerary.airport.code,
      airportName: this.currentItinerary.airport.name,
      city: this.currentItinerary.airport.city,
      arrivalTime: this.currentItinerary.layoverCalculation.timestamps.arrivalTime,
      departureTime: this.currentItinerary.layoverCalculation.timestamps.departureTime,
      layoverDurationMinutes: this.currentItinerary.layoverCalculation.breakdownMinutes.totalLayoverMinutes,
      usableExplorationMinutes: this.currentItinerary.layoverCalculation.breakdownMinutes.actualExplorationMinutes,
      riskScore: this.currentItinerary.riskScore.score,
      riskLevel: this.currentItinerary.riskScore.level,
      selectedAttractions: this.currentItinerary.selectedAttractions,
      timeline: this.currentItinerary.timeline,
      budgetBreakdown: this.currentItinerary.budgetBreakdown,
      hasCheckedLuggage: this.currentItinerary.layoverCalculation.hasCheckedLuggage
    };

    try {
      await LayoverAPI.saveTrip(payload);
      this.showNotification('Trip itinerary successfully saved to your account!', 'success');
    } catch (err) {
      this.showNotification(`Failed to save trip: ${err.message}`, 'error');
    }
  }

  async openSavedTripsModal() {
    const modal = document.getElementById('savedTripsModal');
    const listContainer = document.getElementById('savedTripsList');
    if (!modal || !listContainer) return;

    modal.classList.remove('hidden');
    listContainer.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">Loading saved itineraries...</p>`;

    try {
      const data = await LayoverAPI.getSavedTrips();
      const trips = data.trips || [];

      if (trips.length === 0) {
        listContainer.innerHTML = `
          <div class="text-center py-8">
            <p class="text-3xl mb-2">📭</p>
            <p class="text-sm font-semibold text-white">No saved trips yet</p>
            <p class="text-xs text-slate-400 mt-1">Generate an itinerary and click "Save Trip" to store it.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = trips.map(t => `
        <div class="p-3.5 bg-slate-900 border border-slate-700/80 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div>
            <h5 class="font-bold text-white text-sm">${t.title}</h5>
            <p class="text-slate-400 mt-0.5">${new Date(t.arrivalTime).toLocaleDateString()} • ${t.riskLevel} (${t.riskScore}/100)</p>
            <p class="text-blue-400 font-semibold mt-1">${t.selectedAttractions?.length || 0} stops • ${Math.floor(t.usableExplorationMinutes / 60)}h ${t.usableExplorationMinutes % 60}m exploration</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.app.loadSavedTrip('${t._id || t.id}')" class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition">
              Load
            </button>
            <button onclick="window.app.deleteSavedTrip('${t._id || t.id}')" class="px-2.5 py-1.5 bg-slate-800 hover:bg-red-950 text-red-400 rounded border border-slate-700 hover:border-red-600 transition">
              Delete
            </button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      listContainer.innerHTML = `<p class="text-xs text-red-400 py-4 text-center">Error loading saved trips: ${err.message}</p>`;
    }
  }

  closeSavedTripsModal() {
    const modal = document.getElementById('savedTripsModal');
    if (modal) modal.classList.add('hidden');
  }

  async deleteSavedTrip(id) {
    try {
      await LayoverAPI.deleteTrip(id);
      this.showNotification('Trip deleted.', 'info');
      this.openSavedTripsModal();
    } catch (e) {
      this.showNotification(e.message, 'error');
    }
  }

  switchTab(tabName) {
    this.activeTab = tabName;

    // Tab buttons styling
    const tabs = ['optimizerTab', 'newHereTab', 'devopsTab'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tabBtn_${t}`);
      const pane = document.getElementById(`tabPane_${t}`);
      if (btn) {
        if (t === tabName) {
          btn.classList.add('bg-blue-600', 'text-white', 'shadow');
          btn.classList.remove('text-slate-400', 'hover:text-slate-200');
        } else {
          btn.classList.remove('bg-blue-600', 'text-white', 'shadow');
          btn.classList.add('text-slate-400', 'hover:text-slate-200');
        }
      }
      if (pane) {
        if (t === tabName) pane.classList.remove('hidden');
        else pane.classList.add('hidden');
      }
    });

    if (tabName === 'newHereTab') {
      this.handleGenerateItinerary();
    }
  }

  setLoading(isLoading) {
    const btn = document.getElementById('generateBtn');
    if (btn) {
      if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="inline-block animate-spin mr-2">⚙️</span> Optimizing Flight Safety Plan...`;
      } else {
        btn.disabled = false;
        btn.innerHTML = `⚡ Generate Safe Layover Plan`;
      }
    }
  }

  showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    if (!toast) return;

    let bg = 'bg-blue-900/90 border-blue-500 text-blue-100';
    if (type === 'success') bg = 'bg-emerald-900/90 border-emerald-500 text-emerald-100';
    if (type === 'error') bg = 'bg-red-900/90 border-red-500 text-red-100';
    if (type === 'warning') bg = 'bg-amber-900/90 border-amber-500 text-amber-100';

    toast.className = `fixed bottom-5 left-5 z-50 px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold flex items-center gap-2.5 transition-all duration-300 transform translate-y-0 opacity-100 ${bg}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : (type === 'error' ? '❌' : (type === 'warning' ? '⚠️' : 'ℹ️'))}</span> ${message}`;

    setTimeout(() => {
      toast.classList.add('translate-y-12', 'opacity-0');
    }, 4000);
  }
}

// Instantiate and launch once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new LayoverIQApp();
  window.app.init();
});
