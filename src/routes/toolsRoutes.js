const express = require('express');
const fs = require('fs');
const router = express.Router();
const toolsController = require('../controllers/toolsController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.post('/heartbeat', isAuthenticated, toolsController.heartbeat);
router.get('/tools/status', toolsController.getToolsStatus);
router.put('/tools/status', isAdmin, toolsController.updateToolsStatus);
router.get('/maintenance', toolsController.getMaintenance);
router.put('/maintenance', isAdmin, toolsController.updateMaintenance);

router.get('/admin/notifications', async (req, res) => {
  try {
    const sugerenciasPath = './sugerencias.json';
    const usersPath = './users.json';
    
    let sugerenciasPendientes = 0;
    try {
      if (fs.existsSync(sugerenciasPath)) {
        const data = fs.readFileSync(sugerenciasPath, 'utf8');
        const sugerencias = JSON.parse(data);
        sugerenciasPendientes = Array.isArray(sugerencias) ? sugerencias.filter(s => !s.respondida).length : 0;
      }
    } catch (e) {
      console.error('Error reading sugerencias.json:', e.message);
    }
    
    let usuariosPendientes = 0;
    try {
      if (fs.existsSync(usersPath)) {
        const data = fs.readFileSync(usersPath, 'utf8');
        const users = JSON.parse(data);
        usuariosPendientes = Array.isArray(users) ? users.filter(u => u.status === 'pendiente').length : 0;
      }
    } catch (e) {
      console.error('Error reading users.json:', e.message);
    }
    
    res.json({ sugerenciasPendientes, usuariosPendientes });
  } catch (err) {
    console.error('Error in admin notifications:', err.message);
    res.json({ sugerenciasPendientes: 0, usuariosPendientes: 0 });
  }
});

module.exports = router;
