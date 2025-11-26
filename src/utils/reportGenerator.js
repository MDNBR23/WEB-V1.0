// Report Generator - Excel/PDF exports for analytics

class ReportGenerator {
  constructor() {
    this.pdfMake = window.pdfMake || {};
  }

  // Generate AI Analytics Report (PDF)
  async generateAIReport(stats) {
    try {
      const docDefinition = {
        content: [
          { text: 'Med Tools Hub - AI Assistant Analytics Report', style: 'header' },
          { text: `Generated: ${new Date().toLocaleString('es-CO')}`, style: 'subheader' },
          
          '\n',
          { text: 'Summary Statistics', style: 'sectionHeader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                ['Metric', 'Value'],
                ['Total Queries', stats.total || '0'],
                ['Positive Ratings', stats.ratings?.positive || '0'],
                ['Negative Ratings', stats.ratings?.negative || '0'],
                ['Quality Score', `${stats.quality || 0}%`],
              ]
            }
          },
          
          '\n',
          { text: 'Top Queries', style: 'sectionHeader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                ['Query', 'Count'],
                ...(stats.topQueries?.map(q => [q[0], q[1].toString()]) || [['No data', '-']])
              ]
            }
          },
          
          '\n',
          { text: 'Quality Analysis', style: 'sectionHeader' },
          `Total queries analyzed: ${stats.total}`,
          `Average quality score: ${stats.quality || 0}%`,
          `Positive feedback: ${Math.round(((stats.ratings?.positive || 0) / (stats.total || 1)) * 100)}%`,
          `Negative feedback: ${Math.round(((stats.ratings?.negative || 0) / (stats.total || 1)) * 100)}%`,
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            color: '#008B8B',
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 10,
            color: '#666',
            margin: [0, 0, 0, 15]
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            margin: [0, 10, 0, 5]
          }
        },
        defaultStyle: {
          font: 'Helvetica',
          fontSize: 11
        }
      };

      // Use pdfMake if available
      if (window.pdfMake?.createPdf) {
        window.pdfMake.createPdf(docDefinition).download(`AI-Analytics-${Date.now()}.pdf`);
      } else {
        throw new Error('PDF generation library not available');
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      throw err;
    }
  }

  // Generate CSV Report (Excel compatible)
  generateCSVReport(stats, filename = 'ai-analytics') {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Queries', stats.total || 0],
      ['Positive Ratings', stats.ratings?.positive || 0],
      ['Negative Ratings', stats.ratings?.negative || 0],
      ['Quality Score (%)', stats.quality || 0],
      ['Generated', new Date().toLocaleString('es-CO')],
    ];

    if (stats.topQueries?.length > 0) {
      rows.push(['', '']);
      rows.push(['Top Queries', 'Count']);
      stats.topQueries.forEach(q => {
        rows.push([q[0], q[1]]);
      });
    }

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${Date.now()}.csv`;
    link.click();
  }

  // Generate Shift Analytics Report
  generateShiftReport(shifts, summary) {
    const headers = ['Date', 'Time', 'Entity', 'Currency', 'Amount', 'Type'];
    const rows = shifts.map(s => [
      new Date(s.fecha).toLocaleDateString('es-CO'),
      s.hora || '-',
      s.lugar || '-',
      s.currency || 'COP',
      s.amount || 0,
      s.tipo || 'Regular'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `shifts-report-${Date.now()}.csv`;
    link.click();
  }
}

const reportGenerator = new ReportGenerator();
