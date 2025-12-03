const { pool } = require('../config/database');

exports.getPlantillas = async (req, res) => {
  try {
    let query = `
      SELECT id, nombre, categoria, contenido, fecha, tamanio, global, creador, created_at 
      FROM plantillas 
      WHERE global = true OR creador = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [req.session.user.username]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting plantillas:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.createPlantilla = async (req, res) => {
  try {
    const { nombre, categoria, contenido, global } = req.body;
    
    if (!nombre || !categoria || !contenido) {
      return res.status(400).json({error: 'Datos incompletos'});
    }
    
    const tamanio = Buffer.byteLength(contenido, 'utf8');
    
    if (tamanio > 10 * 1024 * 1024) {
      return res.status(400).json({error: 'La plantilla excede el tamaño máximo de 10MB'});
    }
    
    const isGlobal = req.session.user.role === 'admin' && global === true;
    
    const query = `
      INSERT INTO plantillas (nombre, categoria, contenido, tamanio, global, creador)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      nombre,
      categoria,
      contenido,
      tamanio,
      isGlobal,
      req.session.user.username
    ]);
    
    res.json({success: true, plantilla: result.rows[0]});
  } catch (err) {
    console.error('Error saving plantilla:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.updatePlantilla = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, contenido, global } = req.body;
    
    if (!nombre || !categoria || !contenido) {
      return res.status(400).json({error: 'Datos incompletos'});
    }
    
    const checkQuery = 'SELECT * FROM plantillas WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({error: 'Plantilla no encontrada'});
    }
    
    const plantilla = checkResult.rows[0];
    const isOwner = plantilla.creador === req.session.user.username;
    const isAdmin = req.session.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({error: 'No tienes permiso para editar esta plantilla'});
    }
    
    const tamanio = Buffer.byteLength(contenido, 'utf8');
    
    if (tamanio > 10 * 1024 * 1024) {
      return res.status(400).json({error: 'La plantilla excede el tamaño máximo de 10MB'});
    }
    
    const isGlobal = isAdmin && global === true;
    
    const updateQuery = `
      UPDATE plantillas 
      SET nombre = $1, categoria = $2, contenido = $3, tamanio = $4, global = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      nombre,
      categoria,
      contenido,
      tamanio,
      isGlobal,
      id
    ]);
    
    res.json({success: true, plantilla: result.rows[0]});
  } catch (err) {
    console.error('Error updating plantilla:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.deletePlantilla = async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkQuery = 'SELECT * FROM plantillas WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({error: 'Plantilla no encontrada'});
    }
    
    const plantilla = checkResult.rows[0];
    const isOwner = plantilla.creador === req.session.user.username;
    const isAdmin = req.session.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({error: 'No tienes permiso para eliminar esta plantilla'});
    }
    
    const deleteQuery = 'DELETE FROM plantillas WHERE id = $1';
    await pool.query(deleteQuery, [id]);
    
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting plantilla:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
