/**
 * Budget Planner, Weather Intelligence & Emergency Info UI
 */

class BudgetWeatherUI {
  constructor() {
    this.budgetChart = null;
  }

  renderBudget(budgetData) {
    const container = document.getElementById('budgetBreakdownContainer');
    if (!container || !budgetData) return;

    const { transport, food, attractions, emergencyReserve, total, userBudget, fitsBudget } = budgetData;

    container.innerHTML = `
      <div class="glass-card p-5 border-slate-700/80">
        <div class="flex items-center justify-between gap-2 mb-4">
          <h4 class="text-base font-bold text-white flex items-center gap-2">
            <span>💰 Layover Budget Breakdown</span>
          </h4>
          <span class="px-2.5 py-0.5 text-xs font-bold rounded ${fitsBudget ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}">
            ${fitsBudget ? '✅ Fits User Budget' : '⚠️ Over Budget'}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-center">
            <p class="text-[10px] text-slate-400 font-bold uppercase">Transit</p>
            <p class="text-base font-extrabold text-blue-400 mt-1">₹${transport}</p>
          </div>
          <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-center">
            <p class="text-[10px] text-slate-400 font-bold uppercase">Tickets & Sights</p>
            <p class="text-base font-extrabold text-emerald-400 mt-1">₹${attractions}</p>
          </div>
          <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-center">
            <p class="text-[10px] text-slate-400 font-bold uppercase">Dining & Drinks</p>
            <p class="text-base font-extrabold text-amber-400 mt-1">₹${food}</p>
          </div>
          <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-center">
            <p class="text-[10px] text-slate-400 font-bold uppercase">Reserve Fund</p>
            <p class="text-base font-extrabold text-purple-400 mt-1">₹${emergencyReserve}</p>
          </div>
        </div>

        <div class="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs">
          <div>
            <span class="text-slate-400">Total Estimated Cost:</span>
            <strong class="text-white text-sm ml-1">₹${total}</strong>
          </div>
          <div>
            <span class="text-slate-400">Allocated Budget:</span>
            <strong class="text-white text-sm ml-1">₹${userBudget}</strong>
          </div>
          <div class="${fitsBudget ? 'text-emerald-400' : 'text-red-400'} font-bold">
            ${fitsBudget ? `+₹${userBudget - total} surplus` : `-₹${total - userBudget} deficit`}
          </div>
        </div>
      </div>
    `;
  }

  async updateWeather(airportCode) {
    const container = document.getElementById('weatherCardContainer');
    if (!container) return;

    try {
      const data = await LayoverAPI.getWeather(airportCode);
      const w = data.weather;

      container.innerHTML = `
        <div class="glass-card p-4 border-slate-700/80 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl">
              ${w.icon === 'sun' ? '☀️' : (w.icon === 'cloud-rain' ? '🌧️' : '🌤️')}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-white">${w.city} Weather</span>
                <span class="text-xs text-blue-300 font-bold">${w.tempC}°C</span>
              </div>
              <p class="text-xs text-slate-400">${w.condition} • Humidity: ${w.humidity}</p>
            </div>
          </div>
          <span class="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
            ${w.badgeText}
          </span>
        </div>
      `;
    } catch (e) {
      console.warn(e);
    }
  }
}

window.BudgetWeatherUI = BudgetWeatherUI;
