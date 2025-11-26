// Offline Mode Manager - Basic tools work without internet

class OfflineMode {
  constructor() {
    this.isOnline = navigator.onLine;
    this.init();
  }

  init() {
    window.addEventListener('online', () => this.goOnline());
    window.addEventListener('offline', () => this.goOffline());
    this.checkConnection();
  }

  checkConnection() {
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
      if (this.isOnline) {
        statusEl.innerHTML = '🟢 Conectado';
        statusEl.style.color = 'var(--success)';
      } else {
        statusEl.innerHTML = '🔴 Modo Offline';
        statusEl.style.color = 'var(--error)';
      }
    }
  }

  goOnline() {
    this.isOnline = true;
    this.checkConnection();
    notificationManager?.send('✅ Conexión Restaurada', { body: 'Sincronizando cambios...' });
    this.syncOfflineChanges();
  }

  goOffline() {
    this.isOnline = false;
    this.checkConnection();
    notificationManager?.send('📡 Modo Offline Activado', { body: 'Las herramientas básicas funcionan sin internet' });
  }

  // Herramientas offline
  static correctSpaces(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\s([,.;:])/g, '$1')
      .replace(/([¿?¡!])\s+/g, '$1 ')
      .trim();
  }

  static calculateInfusion(weight, drug, concentration, target) {
    const volume = (target * weight) / concentration;
    return {
      volume: volume.toFixed(2),
      unit: 'mL',
      diluent: (10 - volume).toFixed(2),
      flowRate: (volume / 60).toFixed(2)
    };
  }

  static analyzeABG(pH, pCO2, pO2, HCO3, BE) {
    const result = {
      status: [],
      analysis: ''
    };

    // Acidemia/Alcalemia
    if (pH < 7.35) result.status.push('Acidemia');
    else if (pH > 7.45) result.status.push('Alcalemia');
    else result.status.push('pH Normal');

    // Respiratory component
    if (pCO2 > 45) result.status.push('Acidosis respiratoria');
    else if (pCO2 < 35) result.status.push('Alcalosis respiratoria');

    // Metabolic component
    if (HCO3 < 22) result.status.push('Acidosis metabólica');
    else if (HCO3 > 26) result.status.push('Alcalosis metabólica');

    result.analysis = result.status.join(' + ');
    return result;
  }

  syncOfflineChanges() {
    const offlineData = localStorage.getItem('offlineChanges');
    if (offlineData) {
      console.log('Sincronizando cambios offline...', offlineData);
      // Aquí iría la lógica de sincronización real
      localStorage.removeItem('offlineChanges');
    }
  }
}

const offlineMode = new OfflineMode();
