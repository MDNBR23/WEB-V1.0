// Notification Manager - Push notifications and alerts

class NotificationManager {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.init();
  }

  init() {
    if (this.isSupported) {
      if (Notification.permission === 'default') {
        // Auto-request on first visit
        Notification.requestPermission();
      }
    }
  }

  // Request permission for notifications
  async requestPermission() {
    if (!this.isSupported) return false;
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.error('Permission request failed:', err);
      return false;
    }
  }

  // Send local notification
  send(title, options = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      // Fallback to toast
      return this.sendToast(title, options);
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        tag: 'med-tools-hub',
        requireInteraction: false,
        ...options
      });
    } catch (err) {
      console.error('Notification failed:', err);
    }
  }

  // Send toast notification (fallback)
  sendToast(message, options = {}) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--card);
      border: 2px solid var(--primary);
      padding: 16px 20px;
      border-radius: 8px;
      color: var(--text);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      max-width: 300px;
    `;
    
    toast.textContent = message;
    
    if (options.icon) {
      toast.textContent = `${options.icon} ${message}`;
    }

    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, options.duration || 4000);
  }

  // Alert for drug interactions
  alertDrugInteraction(drug1, drug2, severity = 'warning') {
    const icon = severity === 'critical' ? '⚠️' : '⚡';
    const title = `${icon} Interacción Medicamentosa`;
    const body = `Posible interacción entre ${drug1} y ${drug2}`;

    this.send(title, {
      body,
      tag: `drug-${drug1}-${drug2}`,
      requireInteraction: severity === 'critical'
    });

    // Also show prominent toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${severity === 'critical' ? '#dc2626' : '#f59e0b'};
      color: white;
      padding: 24px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      z-index: 10001;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: scaleIn 0.3s ease;
    `;
    
    toast.innerHTML = `${icon}<br>${body}<br><small style="font-size:12px;margin-top:8px;opacity:0.9;">Consulta con el profesional médico</small>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'scaleOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // Reminder for upcoming shifts
  alertUpcomingShift(shiftInfo) {
    const { fecha, hora, lugar } = shiftInfo;
    const date = new Date(fecha).toLocaleDateString('es-CO');
    
    this.send('📅 Recordatorio de Turno', {
      body: `Turno mañana a las ${hora} en ${lugar}`,
      tag: `shift-${fecha}`,
    });
  }

  // New feature notification
  notifyNewFeature(feature) {
    this.send('✨ Nueva Funcionalidad', {
      body: feature.descripcion,
      tag: `feature-${feature.id}`,
    });
  }

  // Add CSS animations
  static addStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
      
      @keyframes scaleIn {
        from {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0;
        }
        to {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
      }
      
      @keyframes scaleOut {
        from {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        to {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

const notificationManager = new NotificationManager();
NotificationManager.addStyles();
