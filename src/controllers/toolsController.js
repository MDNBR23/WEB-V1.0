const { readJSON, writeJSON } = require('../services/fileService');

exports.heartbeat = async (req, res) => {
  try {
    const users = await readJSON('users.json', []);
    const user = users.find(u => u.username === req.session.user.username);
    
    if (user) {
      user.lastHeartbeat = new Date().toISOString();
      user.isOnline = true;
      await writeJSON('users.json', users);
    }
    
    res.json({success: true});
  } catch (err) {
    console.error('Error in heartbeat:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.getToolsStatus = async (req, res) => {
  try {
    const toolsStatus = await readJSON('tools_status.json', {
      corrector: { enabled: true, name: 'Corrector de Texto' },
      gases: { enabled: true, name: 'Gases Sanguíneos' },
      infusiones: { enabled: true, name: 'Infusiones' },
      plantillas: { enabled: true, name: 'Plantillas' },
      turnos: { enabled: true, name: 'Mis Turnos' },
      ia: { enabled: true, name: 'Asistente IA' },
      guias: { enabled: true, name: 'Guías Clínicas' },
      quiz: { enabled: true, name: 'Evaluaciones' },
      interacciones: { enabled: true, name: 'Interacciones Medicamentosas' }
    });
    res.json(toolsStatus);
  } catch (err) {
    console.error('Error getting tools status:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.updateToolsStatus = async (req, res) => {
  try {
    const toolsStatus = req.body;
    await writeJSON('tools_status.json', toolsStatus);
    res.json({success: true, toolsStatus});
  } catch (err) {
    console.error('Error updating tools status:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.getMaintenance = async (req, res) => {
  try {
    const maintenance = await readJSON('maintenance.json', {
      active: false,
      message: 'Estamos realizando mejoras en el sistema para brindarte una mejor experiencia. Por favor, vuelve en unos minutos.'
    });
    res.json(maintenance);
  } catch (err) {
    console.error('Error getting maintenance status:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.updateMaintenance = async (req, res) => {
  try {
    const {active, message} = req.body;
    const maintenance = {
      active: active || false,
      message: message || 'Estamos realizando mejoras en el sistema para brindarte una mejor experiencia. Por favor, vuelve en unos minutos.'
    };
    await writeJSON('maintenance.json', maintenance);
    res.json({success: true, maintenance});
  } catch (err) {
    console.error('Error updating maintenance status:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
