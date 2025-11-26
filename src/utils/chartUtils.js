// Chart Utilities - Trend visualization

class ChartUtils {
  // Draw simple trend chart (queries over time)
  static drawTrendChart(container, data) {
    if (!container) return;
    
    container.innerHTML = '';
    
    // Group queries by date
    const dateGroups = {};
    data.forEach(log => {
      const date = new Date(log.created_at).toLocaleDateString('es-CO');
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    const dates = Object.keys(dateGroups).sort();
    const counts = dates.map(d => dateGroups[d]);
    const maxCount = Math.max(...counts);

    // Create simple SVG chart
    const width = Math.min(container.clientWidth || 600, 600);
    const height = 300;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    let svg = `<svg width="${width}" height="${height}" style="border:1px solid var(--border);border-radius:8px;background:var(--card);">`;
    
    // Draw axes
    svg += `<line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--border)" stroke-width="2"/>`;
    svg += `<line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="var(--border)" stroke-width="2"/>`;

    // Draw bars
    const barWidth = chartWidth / Math.max(dates.length, 1) * 0.8;
    const barSpacing = chartWidth / Math.max(dates.length, 1);

    dates.forEach((date, i) => {
      const count = counts[i];
      const barHeight = (count / maxCount) * chartHeight;
      const x = padding + i * barSpacing + barSpacing * 0.1;
      const y = height - padding - barHeight;

      svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="var(--primary)" opacity="0.7" rx="4"/>`;
      svg += `<text x="${x + barWidth/2}" y="${height - padding + 20}" text-anchor="middle" font-size="10" fill="var(--muted)">${date}</text>`;
      svg += `<text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" font-size="11" fill="var(--text)" font-weight="600">${count}</text>`;
    });

    // Draw Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxCount / 5) * i);
      const y = height - padding - (chartHeight / 5) * i;
      svg += `<text x="${padding - 30}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--muted)">${value}</text>`;
    }

    svg += '</svg>';
    
    container.innerHTML = svg;
  }

  // Draw rating distribution pie chart
  static drawRatingChart(container, positive, negative) {
    if (!container) return;
    
    container.innerHTML = '';
    
    const total = positive + negative;
    if (total === 0) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">No data</div>';
      return;
    }

    const positivePercent = (positive / total) * 100;
    const negativePercent = (negative / total) * 100;

    const size = 150;
    const positiveAngle = (positivePercent / 100) * 360;
    
    let svg = `<svg width="300" height="200" style="margin:0 auto;display:block;">`;
    
    // Draw pie segments
    const radius = 70;
    const centerX = 100;
    const centerY = 100;

    // Positive (green)
    const path1 = this.getSvgPath(centerX, centerY, radius, 0, positiveAngle);
    svg += `<path d="${path1}" fill="#16a34a" opacity="0.8"/>`;

    // Negative (red)
    const path2 = this.getSvgPath(centerX, centerY, radius, positiveAngle, 360);
    svg += `<path d="${path2}" fill="#dc2626" opacity="0.8"/>`;

    // Labels
    svg += `<text x="${centerX + 90}" y="100" fill="var(--text)" font-size="14" font-weight="600">👍 ${positivePercent.toFixed(0)}%</text>`;
    svg += `<text x="${centerX + 90}" y="125" fill="var(--text)" font-size="14" font-weight="600">👎 ${negativePercent.toFixed(0)}%</text>`;

    svg += '</svg>';
    
    container.innerHTML = svg;
  }

  // Helper to generate SVG arc path
  static getSvgPath(centerX, centerY, radius, startAngle, endAngle) {
    const start = this.polarToCartesian(centerX, centerY, radius, endAngle);
    const end = this.polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

    return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
  }

  static polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
}

const chartUtils = ChartUtils;
