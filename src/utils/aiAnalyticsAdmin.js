// Funciones para cargar analytics de IA en Admin

async function loadAIAnalytics() {
  try {
    const response = await api('/ai/stats');
    response.quality = response.ratings ? Math.round((response.ratings.positive / (response.ratings.positive + response.ratings.negative)) * 100) : 0;
    
    // Actualizar estadísticas principales
    document.getElementById('aiTotalQueries').textContent = response.total || 0;
    document.getElementById('aiPositiveRatings').textContent = response.ratings?.positive || 0;
    document.getElementById('aiNegativeRatings').textContent = response.ratings?.negative || 0;
    
    const positiveCount = response.ratings?.positive || 0;
    const totalRatings = (response.ratings?.positive || 0) + (response.ratings?.negative || 0);
    const quality = totalRatings > 0 ? Math.round((positiveCount / totalRatings) * 100) : 0;
    document.getElementById('aiAverageQuality').textContent = quality + '%';
    
    // Draw trend chart if element exists
    const trendContainer = document.getElementById('aiTrendChart');
    if (trendContainer && typeof chartUtils !== 'undefined') {
      const logsRes = await api('/ai/logs');
      chartUtils.drawTrendChart(trendContainer, logsRes);
    }
    
    // Draw rating chart if element exists
    const ratingContainer = document.getElementById('aiRatingChart');
    if (ratingContainer && typeof chartUtils !== 'undefined') {
      chartUtils.drawRatingChart(ratingContainer, response.ratings?.positive || 0, response.ratings?.negative || 0);
    }
    
    // Top Queries
    const topQueriesDiv = document.getElementById('aiTopQueries');
    if (response.topQueries && response.topQueries.length > 0) {
      topQueriesDiv.innerHTML = response.topQueries.map((q, i) => `
        <div style="padding:12px;background:rgba(var(--primary-rgb),0.05);border-radius:8px;border-left:3px solid var(--primary);">
          <div style="font-size:14px;font-weight:500;color:var(--text);">${i+1}. ${q.query.substring(0, 60)}...</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px;">${q.count} consultas</div>
        </div>
      `).join('');
    } else {
      topQueriesDiv.innerHTML = '<p style="color:var(--muted);margin:0;">Sin datos aún</p>';
    }
    
    // Últimas Consultas
    const logsResponse = await api('/ai/logs');
    const recentLogsDiv = document.getElementById('aiRecentLogs');
    if (logsResponse && logsResponse.length > 0) {
      recentLogsDiv.innerHTML = logsResponse.slice(0, 10).map(log => `
        <div style="padding:12px;background:var(--bg);border-radius:8px;border-left:3px solid ${log.rating === 'positive' ? '#4ade80' : log.rating === 'negative' ? '#f87171' : '#cbd5e0'};">
          <div style="font-size:13px;color:var(--text);font-weight:500;">${log.username}: ${log.query.substring(0, 50)}...</div>
          <div style="font-size:11px;color:var(--muted);margin-top:4px;">
            ${new Date(log.created_at).toLocaleString('es-CO')} 
            ${log.rating === 'positive' ? '👍' : log.rating === 'negative' ? '👎' : '○'}
          </div>
        </div>
      `).join('');
    } else {
      recentLogsDiv.innerHTML = '<p style="color:var(--muted);margin:0;">Sin consultas aún</p>';
    }
  } catch (err) {
    console.error('Error loading AI analytics:', err);
    const msg1 = document.createElement('div'); msg1.style.cssText = 'position:fixed;top:20px;right:20px;background:var(--card);border:2px solid #dc2626;padding:16px 20px;border-radius:8px;z-index:10000;'; msg1.textContent = 'Error cargando analíticas'; document.body.appendChild(msg1); setTimeout(() => msg1.remove(), 4000);
  }
}

function exportAIAnalytics() {
  const stats = document.getElementById('aiTotalQueries').textContent;
  const positive = document.getElementById('aiPositiveRatings').textContent;
  const negative = document.getElementById('aiNegativeRatings').textContent;
  const quality = document.getElementById('aiAverageQuality').textContent;
  
  const csv = `Analítica del Asistente de IA - ${new Date().toLocaleDateString('es-CO')}
Total Consultas,${stats}
Respuestas Útiles,${positive}
Mejora Necesaria,${negative}
Calidad Promedio,${quality}`;
  
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
  element.setAttribute('download', `ai-analytics-${Date.now()}.csv`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  
  const msgS = document.createElement('div'); msgS.style.cssText = 'position:fixed;top:20px;right:20px;background:var(--card);border:2px solid #16a34a;padding:16px 20px;border-radius:8px;z-index:10000;'; msgS.textContent = 'Analíticas exportadas'; document.body.appendChild(msgS); setTimeout(() => msgS.remove(), 4000);
}

// Cargar analytics al abrir el tab
document.addEventListener('DOMContentLoaded', function() {
  const analyticsTab = document.querySelector('[data-tab="analytics"]');
  if (analyticsTab) {
    analyticsTab.addEventListener('click', loadAIAnalytics);
  }
});

function exportAIAnalyticsPDF() {
  const stats = {
    total: parseInt(document.getElementById('aiTotalQueries').textContent) || 0,
    ratings: {
      positive: parseInt(document.getElementById('aiPositiveRatings').textContent) || 0,
      negative: parseInt(document.getElementById('aiNegativeRatings').textContent) || 0
    },
    quality: parseInt(document.getElementById('aiAverageQuality').textContent) || 0,
    topQueries: Array.from(document.querySelectorAll('#aiTopQueries [style*="padding"]')).map(el => {
      const text = el.querySelector('div:first-child')?.textContent || '';
      return [text.split('. ')[1] || text, 1];
    }).slice(0, 5)
  };
  
  if (typeof reportGenerator !== 'undefined') {
    reportGenerator.generateAIReport(stats);
  }
}

window.exportAIAnalyticsPDF = function() {
  const stats = {
    total: parseInt(document.getElementById('aiTotalQueries').textContent) || 0,
    ratings: {
      positive: parseInt(document.getElementById('aiPositiveRatings').textContent) || 0,
      negative: parseInt(document.getElementById('aiNegativeRatings').textContent) || 0
    },
    quality: parseInt(document.getElementById('aiAverageQuality').textContent) || 0,
    topQueries: []
  };
  
  if (typeof reportGenerator !== 'undefined') {
    reportGenerator.generateAIReport(stats).catch(err => {
      console.error('Error generando PDF:', err);
      const msg = document.createElement('div');
      msg.style.cssText = 'position:fixed;top:20px;right:20px;background:var(--card);border:2px solid #dc2626;padding:16px 20px;border-radius:8px;z-index:10000;box-shadow:var(--shadow-lg);';
      msg.textContent = 'Error: ' + (err.message || 'Desconocido');
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 4000);
    });
  }
};
