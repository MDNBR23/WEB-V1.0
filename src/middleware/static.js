const fs = require('fs').promises;
const path = require('path');

function htmlRedirectMiddleware(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  if (req.path.endsWith('.html')) {
    const cleanPath = req.path.replace(/\.html$/, '');
    return res.redirect(301, cleanPath + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
  }
  
  next();
}

async function htmlFileMiddleware(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  if (path.extname(req.path) === '') {
    const normalized = req.path.replace(/^\/+/, '');
    
    if (normalized) {
      const htmlPath = path.join(process.cwd(), `${normalized}.html`);
      try {
        await fs.access(htmlPath);
        return res.sendFile(htmlPath);
      } catch (err) {
        const indexPath = path.join(process.cwd(), normalized, 'index.html');
        try {
          await fs.access(indexPath);
          return res.sendFile(indexPath);
        } catch (err2) {
          return next();
        }
      }
    }
  }
  next();
}

module.exports = { htmlRedirectMiddleware, htmlFileMiddleware };
