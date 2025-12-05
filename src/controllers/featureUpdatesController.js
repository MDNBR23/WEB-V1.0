const { query } = require('../services/dbService');

exports.getFeatureUpdates = async (req, res) => {
  try {
    const result = await query('SELECT * FROM feature_updates ORDER BY created_at DESC');
    
    const updates = result.rows.map(row => ({
      id: row.id,
      titulo: row.title,
      title: row.title,
      descripcion: row.description,
      description: row.description,
      icono: '✨',
      fecha: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : null,
      version: row.version,
      features: row.features,
      is_feature_update: true,
      created_at: row.created_at
    }));
    
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

    const { titulo, title, descripcion, description, version, features } = req.body;
    
    const updateTitle = titulo || title;
    const updateDesc = descripcion || description;
    
    if (!updateTitle || !updateDesc) {
      return res.status(400).json({error: 'Título y descripción son requeridos'});
    }

    const result = await query(
      `INSERT INTO feature_updates (title, description, version, features)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [updateTitle, updateDesc, version, JSON.stringify(features || [])]
    );

    const row = result.rows[0];
    const featureUpdate = {
      id: row.id,
      titulo: row.title,
      descripcion: row.description,
      icono: '✨',
      fecha: new Date(row.created_at).toISOString().split('T')[0],
      is_feature_update: true,
      created_at: row.created_at
    };

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
    await query('DELETE FROM feature_updates WHERE id = $1', [id]);

    res.json({success: true});
  } catch (err) {
    console.error('Error deleting feature update:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
