// Device Memory & Quick Login Feature

class DeviceManager {
  constructor() {
    this.storageKey = 'med_tools_remembered_devices';
    this.loadDevices();
  }

  loadDevices() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.devices = stored ? JSON.parse(stored) : {};
    } catch {
      this.devices = {};
    }
  }

  saveDevices() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.devices));
  }

  rememberDevice(deviceId, deviceName) {
    const now = new Date().toISOString();
    this.devices[deviceId] = {
      name: deviceName,
      lastUsed: now,
      createdAt: this.devices[deviceId]?.createdAt || now
    };
    this.saveDevices();
  }

  getRememberedDevices() {
    return Object.entries(this.devices).map(([id, info]) => ({
      id,
      ...info
    }));
  }

  forgetDevice(deviceId) {
    delete this.devices[deviceId];
    this.saveDevices();
  }

  forgetAllDevices() {
    this.devices = {};
    this.saveDevices();
  }

  getDeviceFingerprint() {
    // Simple device fingerprint based on browser/OS characteristics
    const screen = `${window.screen.width}x${window.screen.height}`;
    const lang = navigator.language;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const ua = navigator.userAgent.substring(0, 50);
    
    const combined = `${screen}|${lang}|${tz}|${ua}`;
    let hash = 0;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
  }
}

const deviceManager = new DeviceManager();
