# LayoverIQ — REST API Specifications
> **"Smart decisions between flights."**

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Create a new user account.

**Request Payload:**
```json
{
  "name": "Alex Vance",
  "email": "alex@travel.com",
  "password": "Password123!",
  "homeCity": "Delhi",
  "preferredCurrency": "INR"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_1725200000_abcde",
    "name": "Alex Vance",
    "email": "alex@travel.com",
    "homeCity": "Delhi"
  }
}
```

---

### `POST /auth/login`
Authenticate with email & password.

---

### `POST /auth/demo-login`
Instant 1-click test login for live lab presentations without entering credentials.

---

## 2. Layover & Itinerary Endpoints

### `POST /layover/calculate`
Calculates immigration times, buffers, transit duration, and net exploration time.

**Request Payload:**
```json
{
  "airportCode": "DXB",
  "arrivalTime": "2026-09-01T10:00:00Z",
  "departureTime": "2026-09-01T18:30:00Z",
  "hasCheckedLuggage": false,
  "isInternationalFlight": true,
  "preferredTransport": "metro"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "breakdownMinutes": {
    "totalLayoverMinutes": 510,
    "totalAirportProcessingMinutes": 60,
    "totalTransitMinutes": 50,
    "airportSafetyBufferMinutes": 120,
    "actualExplorationMinutes": 280
  },
  "formatted": {
    "totalLayover": "8 hours 30 min",
    "airportProcessing": "1 hour",
    "transitTime": "50 minutes",
    "airportSafetyBuffer": "2 hours",
    "actualExplorationTime": "4 hours 40 min",
    "recommendedReturnFormatted": "4:30 PM",
    "latestCityDepartureFormatted": "4:05 PM"
  },
  "isViableForCityExploration": true
}
```

---

### `POST /layover/generate`
Generates a complete, flight-safe minute-by-minute timeline.

**Request Payload:**
```json
{
  "airportCode": "DXB",
  "arrivalTime": "2026-09-01T10:00:00Z",
  "departureTime": "2026-09-01T18:30:00Z",
  "budget": 3000,
  "interests": ["landmarks", "food", "photography"],
  "preferredTransport": "metro",
  "travelers": 1,
  "hasCheckedLuggage": false,
  "isNewHere": false
}
```

---

## 3. Simulation & Emergency Endpoints

### `POST /simulation/can-i-visit`
Evaluates whether a specific attraction is safe to visit.

**Request Payload:**
```json
{
  "airportCode": "DXB",
  "attractionId": "dxb_burj_khalifa",
  "arrivalTime": "2026-09-01T10:00:00Z",
  "departureTime": "2026-09-01T18:30:00Z",
  "transportMode": "metro"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "status": "SAFE",
  "verdictTitle": "🟢 SAFE",
  "advice": "You have ample time to visit Burj Khalifa & Observation Deck with a comfortable 2 hours 55 min buffer.",
  "calculation": {
    "travelFromAirportFormatted": "25 minutes",
    "recommendedVisitDurationFormatted": "1 hour 15 min",
    "returnJourneyFormatted": "25 minutes",
    "airportSafetyBufferFormatted": "2 hours"
  }
}
```

---

### `POST /simulation/what-if`
Performs real-time perturbation recalculation for changed durations and transports.

---

### `POST /simulation/running-late`
Triggers emergency flight-safety evacuation protocol.

**Request Payload:**
```json
{
  "delayMinutes": 35,
  "airportCode": "DXB",
  "arrivalTime": "2026-09-01T10:00:00Z",
  "departureTime": "2026-09-01T18:30:00Z"
}
```

---

## 4. AI Assistant Endpoint

### `POST /ai/chat`
Conversational flight layover assistant with NLP intent extractor and local fallback.

**Request Payload:**
```json
{
  "message": "I have 5 hours in Dubai and I love food.",
  "context": {
    "airportCode": "DXB",
    "preferredTransport": "metro"
  }
}
```
