/**
 * Offline Itinerary Persistence & Boarding-Pass Print Exporter
 */

class OfflineExportManager {
  constructor() {
    this.storageKey = 'layoveriq_offline_trip';
  }

  saveToOffline(itineraryData) {
    if (!itineraryData) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        savedAt: new Date().toISOString(),
        data: itineraryData
      }));
      window.app.showNotification('Itinerary saved for offline access!', 'success');
    } catch (e) {
      console.warn('LocalStorage full or disabled', e);
    }
  }

  getOfflineTrip() {
    try {
      const item = localStorage.getItem(this.storageKey);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  downloadJSON(itineraryData) {
    const data = itineraryData || (this.getOfflineTrip()?.data);
    if (!data) {
      window.app.showNotification('No active itinerary to download.', 'error');
      return;
    }

    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `LayoverIQ_${data.airport?.code || 'Trip'}_Itinerary.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    window.app.showNotification('Itinerary JSON downloaded!', 'success');
  }

  printBoardingPass(itineraryData) {
    const data = itineraryData || (this.getOfflineTrip()?.data);
    if (!data) {
      window.app.showNotification('No active itinerary to print.', 'error');
      return;
    }

    // Trigger browser print dialog with styled printable view
    window.print();
  }
}

window.OfflineExportManager = OfflineExportManager;
