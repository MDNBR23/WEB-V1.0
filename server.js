require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const { initializeDatabase } = require('./src/config/database');
const sessionConfig = require('./src/config/session');
const { initializeData } = require('./src/services/initService');
const { initializeInfusionMedications } = require('./src/services/infusionInitService');
const { htmlRedirectMiddleware, htmlFileMiddleware } = require('./src/middleware/static');

const authRoutes = require('./src/routes/authRoutes');
const usersRoutes = require('./src/routes/usersRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const medicationsRoutes = require('./src/routes/medicationsRoutes');
const anunciosRoutes = require('./src/routes/anunciosRoutes');
const guiasRoutes = require('./src/routes/guiasRoutes');
const sugerenciasRoutes = require('./src/routes/sugerenciasRoutes');
const shiftsRoutes = require('./src/routes/shiftsRoutes');
const plantillasRoutes = require('./src/routes/plantillasRoutes');
const resetPasswordRoutes = require('./src/routes/resetPasswordRoutes');
const backupRoutes = require('./src/routes/backupRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const toolsRoutes = require('./src/routes/toolsRoutes');
const featureUpdatesRoutes = require('./src/routes/featureUpdatesRoutes');

const app = express();
const PORT = 5000;
const HOST = '0.0.0.0';

app.set('trust proxy', true);

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

app.use(session(sessionConfig));

// Enable WebAuthn in cross-origin iframes (required for Replit)
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'publickey-credentials-get=*, publickey-credentials-create=*');
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`${req.method} ${req.path} - Session ID: ${req.sessionID}, User ID: ${req.session?.userId}`);
  }
  next();
});

app.use(htmlRedirectMiddleware);

app.use(express.static('.', {
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  },
  extensions: ['html']
}));

app.use(htmlFileMiddleware);

app.use('/api', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/medications', medicationsRoutes);
app.use('/api/anuncios', anunciosRoutes);
app.use('/api/feature-updates', featureUpdatesRoutes);
app.use('/api/guias', guiasRoutes);
app.use('/api/sugerencias', sugerenciasRoutes);
app.use('/api/shifts', shiftsRoutes);
app.use('/api/plantillas', plantillasRoutes);
app.use('/api', resetPasswordRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', toolsRoutes);

Promise.all([
  initializeDatabase(),
  initializeData(),
  initializeInfusionMedications()
]).then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`Med Tools Hub Server running at http://${HOST}:${PORT}/`);
  });
}).catch(err => {
  console.error('Error during initialization:', err);
  process.exit(1);
});
