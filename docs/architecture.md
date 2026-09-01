# LayoverIQ — System Architecture & Mathematical Models
> **"Smart decisions between flights."**

LayoverIQ is an intelligent flight-safety layover optimization platform. Unlike navigation tools that solve general point-to-point routing, LayoverIQ solves the **Constrained Layover Optimization Problem**:

$$\text{Max} \sum_{i \in S} \text{Utility}(i) \quad \text{subject to} \quad T_{\text{total}} \le T_{\text{layover}} - T_{\text{buffers}}$$

---

## 1. High-Level Architectural Diagram

```
+-----------------------------------------------------------------------------------+
|                                  USER / CLIENT                                    |
|   +---------------------------------------------------------------------------+   |
|   |  Single Page App: Leaflet Map | Interactive Timeline | "What If?" Slider  |   |
|   |  "Can I Visit?" Modal | "I'm Running Late" Mode | Offline Boarding Pass   |   |
|   +---------------------------------------------------------------------------+   |
+------------------------------------------+----------------------------------------+
                                           | HTTP / REST (JSON)
                                           v
+-----------------------------------------------------------------------------------+
|                             EXPRESS.JS APPLICATION SERVER                         |
|   +---------------------------------------------------------------------------+   |
|   |  CORS Middleware | JWT Security | Central Error Handler | Health Monitor  |   |
|   +---------------------------------------------------------------------------+   |
|                                          |                                        |
|   +--------------------------------------+------------------------------------+   |
|   |                         INTELLIGENT SERVICES CORE                         |   |
|   |                                                                           |   |
|   |   +-----------------------+   +-----------------------+                   |   |
|   |   |   Layover Calculator  |   |  Itinerary Generator  |                   |   |
|   |   +-----------------------+   +-----------------------+                   |   |
|   |   |   Risk Scoring Engine |   |  Can-I-Visit Feasibility|                  |   |
|   |   +-----------------------+   +-----------------------+                   |   |
|   |   |   What-If Simulator   |   |  Emergency Optimizer  |                   |   |
|   |   +-----------------------+   +-----------------------+                   |   |
|   |   |   Budget & Weather    |   |  AI Travel Assistant  |                   |   |
|   |   +-----------------------+   +-----------------------+                   |   |
|   +--------------------------------------+------------------------------------+   |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                        DUAL-MODE PERSISTENCE & DATA LAYER                         |
|   +-------------------------------------+  +----------------------------------+   |
|   | MongoDB + Mongoose (Production)     |  | High-Perf In-Memory Store (Dev)  |   |
|   +-------------------------------------+  +----------------------------------+   |
|   | Airport & Attractions Transit Graph |  | Offline LocalStorage Mirror      |   |
|   +-------------------------------------+  +----------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Mathematical Models

### A. Net Usable Exploration Time Formula

Let:
- $T_{\text{arr}}$: Flight touchdown timestamp
- $T_{\text{dep}}$: Connecting flight departure timestamp
- $T_{\text{layover}} = T_{\text{dep}} - T_{\text{arr}}$: Total layover duration (minutes)
- $T_{\text{imm}}$: International inbound immigration and customs processing (minutes)
- $T_{\text{exit}}$: Airport terminal exit buffer (minutes)
- $T_{\text{baggage}}$: Checked baggage claim + left luggage drop-off buffer (if applicable)
- $T_{\text{outbound}}$: Transit duration from airport terminal to city center
- $T_{\text{inbound}}$: Transit duration from city back to airport
- $T_{\text{buffer}}$: Mandatory pre-flight return buffer (120–180 min for international flights)

The **Realistically Usable Exploration Time ($T_{\text{explore}}$)** is strictly evaluated as:

$$T_{\text{explore}} = \max\Big(0, \, T_{\text{layover}} - (T_{\text{imm}} + T_{\text{exit}} + T_{\text{baggage}} + T_{\text{outbound}} + T_{\text{inbound}} + T_{\text{buffer}})\Big)$$

*Safety Threshold Rule:* If $T_{\text{explore}} < 60\text{ minutes}$, the city exploration mode is locked to **Terminal Transit Safety Mode** to protect the passenger from missing their flight.

---

### B. Multi-Factor Risk Score Engine

The risk score $R \in [10, 100]$ calculates flight punctuality security:

$$R = 0.30 \cdot S_{\text{buffer}} + 0.30 \cdot S_{\text{margin}} + 0.20 \cdot S_{\text{transit}} + 0.10 \cdot S_{\text{hops}} + 0.10 \cdot S_{\text{external}}$$

Where:
1. **$S_{\text{buffer}}$ (Airport Buffer Score)**: 100 for $\ge 150\text{ min}$, 90 for $\ge 120\text{ min}$, 75 for $\ge 90\text{ min}$, 50 for $\ge 60\text{ min}$, 20 for $<60\text{ min}$.
2. **$S_{\text{margin}}$ (Slack Margin Score)**: Measures breathing room between scheduled activity and net exploration time.
3. **$S_{\text{transit}}$ (Transit Reliability)**: Metro ($98\%$), Express Taxi ($85\%$), Public Bus ($75\%$).
4. **$S_{\text{hops}}$ (Complexity Penalty)**: 1–2 stops ($98\%$), 3 stops ($85\%$), 4 stops ($70\%$), 5+ stops ($55\%$).
5. **$S_{\text{external}}$ (Weather & Luggage Factor)**: Rain/Storm penalties ($-15\%$), Checked bags ($-10\%$).

**Classification Bands:**
- $\ge 85$: 🟢 **LOW RISK**
- $60 - 84$: 🟡 **MEDIUM RISK**
- $< 60$: 🔴 **HIGH RISK**

---

### C. "Can I Actually Visit This?" Feasibility Verification

For a specific candidate attraction $A$:

$$T_{\text{req}}(A) = T_{\text{airport\_exit}} + T_{\text{transit}}(Airport \to A) + T_{\text{visit}}(A) + T_{\text{transit}}(A \to Airport) + T_{\text{buffer}}$$

$$\text{Surplus Margin} = T_{\text{layover}} - T_{\text{req}}(A)$$

- $\text{Surplus} \ge 40\text{ min} \implies$ 🟢 **SAFE**
- $0 \le \text{Surplus} < 40\text{ min} \implies$ 🟡 **RISKY**
- $\text{Surplus} < 0 \implies$ 🔴 **NOT RECOMMENDED**

---

### D. "I'm Running Late" Emergency Optimization

When a delay of $\Delta t_{\text{delay}}$ occurs:
1. **Prune**: Drop all low-priority stops $\text{Attraction}_{i}$ where $i > 1$.
2. **Fastest Mode Selection**: $\text{Mode} \leftarrow \text{Express Taxi / Cab}$.
3. **Latest Safe City Departure**:

$$\text{Latest Departure} = T_{\text{dep}} - (T_{\text{min\_buffer}} + T_{\text{taxi\_return}})$$
