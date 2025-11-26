// Dashboard de Analítica de IA

class AIAnalytics {
  static getStats() {
    return aiChatManager.getStats();
  }

  static renderDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stats = this.getStats();
    const html = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="padding: 20px; background: var(--card); border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${stats.totalQueries}</div>
          <div style="font-size: 13px; color: var(--muted); margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Total de Consultas</div>
        </div>
        
        <div style="padding: 20px; background: var(--card); border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="font-size: 32px; font-weight: 700; color: #4ade80;">${stats.averageRating}%</div>
          <div style="font-size: 13px; color: var(--muted); margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Calificación Positiva</div>
        </div>
        
        <div style="padding: 20px; background: var(--card); border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="font-size: 32px; font-weight: 700; color: #4ade80;">👍 ${stats.positiveRatings}</div>
          <div style="font-size: 13px; color: var(--muted); margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Respuestas Útiles</div>
        </div>
        
        <div style="padding: 20px; background: var(--card); border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="font-size: 32px; font-weight: 700; color: #f87171;">👎 ${stats.negativeRatings}</div>
          <div style="font-size: 13px; color: var(--muted); margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Mejora Necesaria</div>
        </div>
      </div>
      
      <div style="background: var(--card); border-radius: 12px; border: 1px solid var(--border); padding: 20px;">
        <h4 style="margin: 0 0 16px 0; color: var(--text); font-size: 16px; font-weight: 600;">📊 Consultas Más Frecuentes</h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${stats.topQueries.length > 0 
            ? stats.topQueries.map(([query, count]) => `
                <div style="padding: 12px; background: rgba(var(--primary-rgb), 0.05); border-radius: 8px; border-left: 3px solid var(--primary);">
                  <div style="font-size: 14px; color: var(--text); font-weight: 500;">${query}</div>
                  <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">${count} consulta${count !== 1 ? 's' : ''}</div>
                </div>
              `).join('')
            : '<p style="color: var(--muted); margin: 0;">Sin datos aún</p>'
          }
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  static exportStats() {
    const stats = this.getStats();
    const csv = `
      Estadísticas de IA - ${new Date().toLocaleDateString('es-CO')}
      ====================================================
      
      Total de Consultas: ${stats.totalQueries}
      Calificación Positiva: ${stats.averageRating}%
      Respuestas Útiles: ${stats.positiveRatings}
      Mejora Necesaria: ${stats.negativeRatings}
      
      Top Consultas:
      ${stats.topQueries.map(([q, c]) => `"${q}": ${c}`).join('\n')}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `ai-stats-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

window.AIAnalytics = AIAnalytics;
