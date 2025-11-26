const crypto = require('crypto');
const { readJSON, writeJSON } = require('../services/fileService');

exports.getFeatureUpdates = async (req, res) => {
  try {
    const updates = await readJSON('feature_updates.json', []);
    res.json(updates);
  } catch (err) {
    console.error('Error getting feature updates:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.createFeatureUpdate = async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({error: 'Solo administradores pueden crear actualizaciones'});
    }

    const { titulo, descripcion, icono, fecha } = req.body;
    
    if (!titulo || !descripcion) {
      return res.status(400).json({error: 'Título y descripción son requeridos'});
    }

    const featureUpdate = {
      id: crypto.randomUUID(),
      titulo,
      descripcion,
      icono: icono || '✨',
      fecha: fecha || new Date().toISOString().split('T')[0],
      is_feature_update: true,
      created_at: new Date().toISOString()
    };

    const updates = await readJSON('feature_updates.json', []);
    updates.push(featureUpdate);
    await writeJSON('feature_updates.json', updates);

    res.json({success: true, featureUpdate});
  } catch (err) {
    console.error('Error creating feature update:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.deleteFeatureUpdate = async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({error: 'Solo administradores pueden eliminar actualizaciones'});
    }

    const { id } = req.params;
    const updates = await readJSON('feature_updates.json', []);
    const filtered = updates.filter(u => u.id !== id);
    await writeJSON('feature_updates.json', filtered);

    res.json({success: true});
  } catch (err) {
    console.error('Error deleting feature update:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
