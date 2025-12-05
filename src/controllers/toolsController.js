const { query } = require('../services/dbService');

exports.heartbeat = async (req, res) => {
  try {
    const now = new Date();
    await query(
      'UPDATE users SET last_heartbeat = $1, is_online = true WHERE username = $2',
      [now, req.session.user.username]
    );
    res.json({success: true});
  } catch (err) {
    console.error('Error in heartbeat:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.getToolsStatus = async (req, res) => {
  try {
    const result = await query('SELECT tool_name, is_enabled FROM tools_status');
    
    const defaultTools = {
      corrector: { enabled: true, name: 'Corrector de Texto' },
      gases: { enabled: true, name: 'Gases Sanguíneos' },
      infusiones: { enabled: true, name: 'Infusiones' },
      plantillas: { enabled: true, name: 'Plantillas' },
      turnos: { enabled: true, name: 'Mis Turnos' },
      ia: { enabled: true, name: 'Asistente IA' },
      guias: { enabled: true, name: 'Guías Clínicas' },
      quiz: { enabled: true, name: 'Evaluaciones' },
      interacciones: { enabled: true, name: 'Interacciones Medicamentosas' }
    };
    
    for (const row of result.rows) {
      if (defaultTools[row.tool_name]) {
        defaultTools[row.tool_name].enabled = row.is_enabled;
      }
    }
    
    res.json(defaultTools);
  } catch (err) {
    console.error('Error getting tools status:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.updateToolsStatus = async (req, res) => {
  try {
    const toolsStatus = req.body;
    
    for (const [toolName, toolData] of Object.entries(toolsStatus)) {
      await query(`
        INSERT INTO tools_status (tool_name, is_enabled)
        VALUES ($1, $2)
        ON CONFLICT (tool_name) DO UPDATE SET is_enabled = $2, updated_at = CURRENT_TIMESTAMP
      `, [toolName, toolData.enabled]);
    }
    
    res.json({success: true, toolsStatus});
  } catch (err) {
    console.error('Error updating tools status:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.getMaintenance = async (req, res) => {
  try {
    const result = await query('SELECT * FROM maintenance ORDER BY id DESC LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.json({
        active: false,
        message: 'Estamos realizando mejoras en el sistema para brindarte una mejor experiencia. Por favor, vuelve en unos minutos.'
      });
    }
    
    res.json({
      active: result.rows[0].is_active,
      message: result.rows[0].message || 'Estamos realizando mejoras en el sistema para brindarte una mejor experiencia. Por favor, vuelve en unos minutos.'
    });
  } catch (err) {
    console.error('Error getting maintenance status:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.updateMaintenance = async (req, res) => {
  try {
    const {active, message} = req.body;
    
    const existingResult = await query('SELECT id FROM maintenance ORDER BY id DESC LIMIT 1');
    
    if (existingResult.rows.length === 0) {
      await query(
        'INSERT INTO maintenance (is_active, message) VALUES ($1, $2)',
        [active || false, message || 'Estamos realizando mejoras en el sistema.']
      );
    } else {
      await query(
        'UPDATE maintenance SET is_active = $1, message = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [active || false, message || 'Estamos realizando mejoras en el sistema.', existingResult.rows[0].id]
      );
    }
    
    res.json({success: true, maintenance: { active, message }});
  } catch (err) {
    console.error('Error updating maintenance status:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
