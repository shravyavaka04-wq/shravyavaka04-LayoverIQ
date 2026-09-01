# ✈️ LayoverIQ — Intelligent Layover Travel & Transit Manager
> **"Smart decisions between flights."**

[![Tests](https://img.shields.io/badge/Tests-17%20Passed-success)](https://jestjs.io)
[![Node Version](https://img.shields.io/badge/Node-v20%2B-blue)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

---

## 1. Project Overview & Unique Selling Proposition (USP)

**LayoverIQ** is an intelligent travel-planning platform designed for travelers who have a long connecting flight layover and want to safely explore the transit city without risking their next flight.

### The Core Difference:
> **Google Maps answers:** *"How do I get from A to B?"*  
> **LayoverIQ answers:** *"Given my 8-hour layover, 10:00 AM landing, 6:30 PM takeoff, immigration queues, and luggage, what can I safely visit and EXACTLY when must I depart the city to return to the airport safely?"*

LayoverIQ calculates realistic usable exploration time and generates a flight-safe itinerary around the fixed deadline of your connecting flight.

---

## 2. Key Intelligent Features

* **⏱️ Smart Layover Calculator**: Subtracts immigration, baggage claim, airport exit, roundtrip transit, and mandatory safety buffers to reveal real usable exploration time.
* **📅 Flight-Safe Itinerary Generator**: Minute-by-minute constraint-based timeline with exact departure deadlines.
* **🔍 "Can I Actually Visit This?" Feasibility Engine**: Evaluates any attraction with mathematical proof and returns 🟢 **SAFE**, 🟡 **RISKY**, or 🔴 **NOT RECOMMENDED**.
* **🚦 Multi-Factor Risk Score (0–100)**: Transparent scoring based on buffer ratios, transit reliability, and hop complexity.
* **🎛️ "What If?" Dynamic Simulator**: Real-time perturbation analysis for extra sightseeing time, transport switches, and departure offsets.
* **🚨 "I'M RUNNING LATE" Emergency Protocol**: 1-click panic recovery that prunes secondary stops, routes fastest taxi evacuation, and calculates the absolute last safe departure time.
* **🔰 "I'm New Here" Mode**: Curated beginner-friendly highlights with "Why LayoverIQ picked this" rationale.
* **🗺️ Interactive Map**: Real-time Leaflet GIS route geometry showing the airport hub and sightseeing perimeter.
* **🌧️ Weather-Aware Adaptation**: Automatically swaps outdoor sightseeing for indoor museums/malls during rain or extreme heat.
* **💰 Budget Planner**: Multi-category breakdown across Transit, Tickets, Dining, and Emergency Reserves.
* **📴 Offline Itinerary & Boarding Pass Export**: Printable offline boarding pass view, PDF generation, and JSON sync.
* **🤖 AI Travel Assistant**: Conversational assistant with intelligent NLP intent extractor and local zero-API fallback.

---

## 3. Technology Stack

* **Frontend**: HTML5, Tailwind CSS, Vanilla Modern JavaScript (ES6+ Modules), Leaflet.js, Custom Airport Glassmorphism Design.
* **Backend**: Node.js, Express.js REST API.
* **Database**: Dual-Mode (MongoDB with Mongoose + Zero-Config In-Memory / Local Repository Fallback).
* **Testing Framework**: Jest & Supertest (17 automated unit and integration tests).

---

## 4. Installation & Quickstart

### Prerequisites
* Node.js (v18 or higher)
* npm (v9 or higher)

### Step-by-Step Setup:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/LayoverIQ.git
   cd LayoverIQ
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```

4. **Run Automated Test Suites:**
   ```bash
   npm test
   ```

5. **Start the LayoverIQ Application:**
   ```bash
   npm start
   ```

6. **Open in Browser:**
   Navigate to [http://localhost:5000](http://localhost:5000) to view the live dashboard!

---

## 5. Demo Presentation Scenarios

For live evaluations and demonstrations, test the following pre-configured scenarios:

* **Scenario 1: Dubai International (DXB)**
  * Arrival: 10:00 AM | Departure: 6:30 PM (8.5h layover)
  * Result: ~4h 40m exploration time, Burj Khalifa + Dubai Mall + Al Fahidi, 🟢 Low Risk (88/100).
* **Scenario 2: Singapore Changi (SIN)**
  * Arrival: 11:00 AM | Departure: 5:00 PM (6.0h layover)
  * Result: ~2h 45m exploration time, Jewel Waterfall + Gardens by the Bay, 🟢 Low Risk (91/100).
* **Scenario 3: Short Layover (2.5h)**
  * Result: Locks to Terminal Safe Mode with Jewel/Lounge recommendations to prevent missing flight!

---

## 6. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
