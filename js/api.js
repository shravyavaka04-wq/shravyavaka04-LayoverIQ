/**
 * LayoverIQ — Frontend API Service Client
 * "Smart decisions between flights."
 */

const API_BASE = '/api';

class LayoverAPI {
  static getAuthHeaders() {
    const token = localStorage.getItem('layoveriq_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  static async request(endpoint, options = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...(options.headers || {})
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (error) {
      console.error(`API Error on [${endpoint}]:`, error);
      throw error;
    }
  }

  // Airports & Attractions
  static async getAirports() {
    return this.request('/layover/airports');
  }

  static async getAttractions(airportCode) {
    return this.request(`/layover/attractions?airportCode=${airportCode || ''}`);
  }

  static async getWeather(airportCode) {
    return this.request(`/layover/weather?airportCode=${airportCode || 'DXB'}`);
  }

  // Layover Calculations & Itinerary
  static async calculateLayover(payload) {
    return this.request('/layover/calculate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async generateItinerary(payload) {
    return this.request('/layover/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Simulation Engines
  static async canIVisit(payload) {
    return this.request('/simulation/can-i-visit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async simulateWhatIf(payload) {
    return this.request('/simulation/what-if', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async emergencyRunningLate(payload) {
    return this.request('/simulation/running-late', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // AI Travel Assistant
  static async chatWithAI(message, context = {}) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context })
    });
  }

  // Authentication
  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  static async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  static async demoLogin() {
    return this.request('/auth/demo-login', {
      method: 'POST'
    });
  }

  static async getProfile() {
    return this.request('/auth/profile');
  }

  // Saved Trips
  static async saveTrip(tripData) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
  }

  static async getSavedTrips() {
    return this.request('/trips');
  }

  static async deleteTrip(id) {
    return this.request(`/trips/${id}`, {
      method: 'DELETE'
    });
  }
}

window.LayoverAPI = LayoverAPI;
