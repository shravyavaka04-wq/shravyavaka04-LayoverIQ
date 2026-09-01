/**
 * Leaflet Interactive Map Controller for LayoverIQ
 */

class MapUI {
  constructor() {
    this.map = null;
    this.markers = [];
    this.polyline = null;
  }

  initMap() {
    const mapElement = document.getElementById('mapContainer');
    if (!mapElement || typeof L === 'undefined') return;

    if (!this.map) {
      // Default to Dubai Airport coords
      this.map = L.map('mapContainer', {
        zoomControl: true,
        scrollWheelZoom: false
      }).setView([25.2532, 55.3657], 11);

      // Add modern dark-mode OpenStreetMap tiles (CartoDB Dark Matter / OSM standard)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(this.map);
    }
  }

  updateMap(itineraryData) {
    if (!this.map) this.initMap();
    if (!this.map || !itineraryData) return;

    // Clear previous markers & polylines
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
    if (this.polyline) this.map.removeLayer(this.polyline);

    const airport = itineraryData.airport;
    const attractions = itineraryData.selectedAttractions || [];

    if (!airport || !airport.coordinates) return;

    const routeCoords = [];

    // 1. Add Airport Marker
    const airportIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `<div style="background:#3A86FF; color:white; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:16px; border:2px solid white; box-shadow:0 0 10px rgba(58,134,255,0.7);">✈️</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const airportMarker = L.marker([airport.coordinates.lat, airport.coordinates.lng], { icon: airportIcon })
      .addTo(this.map)
      .bindPopup(`
        <div style="font-family:sans-serif; color:#0f172a;">
          <h4 style="font-weight:bold; font-size:14px; margin-bottom:4px;">${airport.name} (${airport.code})</h4>
          <p style="font-size:12px; color:#475569; margin:0;">Base Transit Hub</p>
          <p style="font-size:11px; color:#2563eb; font-weight:bold; margin-top:4px;">Must return by ${itineraryData.layoverCalculation.formatted.recommendedReturnFormatted}</p>
        </div>
      `);

    this.markers.push(airportMarker);
    routeCoords.push([airport.coordinates.lat, airport.coordinates.lng]);

    // 2. Add Attraction Markers
    attractions.forEach((attr, idx) => {
      if (attr.coordinates) {
        const attrIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div style="background:#10B981; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; border:2px solid white; box-shadow:0 0 8px rgba(16,185,129,0.7);">${idx + 1}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([attr.coordinates.lat, attr.coordinates.lng], { icon: attrIcon })
          .addTo(this.map)
          .bindPopup(`
            <div style="font-family:sans-serif; color:#0f172a;">
              <h4 style="font-weight:bold; font-size:13px; margin-bottom:2px;">Stop #${idx + 1}: ${attr.name}</h4>
              <p style="font-size:11px; color:#64748b; margin:0;">${attr.categories.join(', ')}</p>
              <p style="font-size:11px; color:#10b981; font-weight:bold; margin-top:3px;">Visit: ${attr.durationMin} mins | Entry: ₹${attr.costINR}</p>
            </div>
          `);

        this.markers.push(marker);
        routeCoords.push([attr.coordinates.lat, attr.coordinates.lng]);
      }
    });

    // Close loop back to airport
    routeCoords.push([airport.coordinates.lat, airport.coordinates.lng]);

    // 3. Draw Route Polyline
    this.polyline = L.polyline(routeCoords, {
      color: '#3A86FF',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8'
    }).addTo(this.map);

    // Fit map view
    if (routeCoords.length > 1) {
      this.map.fitBounds(this.polyline.getBounds(), { padding: [40, 40] });
    }
  }
}

window.MapUI = MapUI;
