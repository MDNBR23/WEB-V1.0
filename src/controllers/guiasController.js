const { query } = require('../services/dbService');

exports.getGuias = async (req, res) => {
  try {
    let result;
    
    if (req.session.user.role === 'admin') {
      result = await query('SELECT * FROM guias WHERE active = true ORDER BY created_at DESC');
    } else {
      result = await query(
        'SELECT * FROM guias WHERE active = true AND (created_by IS NULL OR created_by = $1) ORDER BY created_at DESC',
        [req.session.user.username]
      );
    }
    
    const guias = result.rows.map(row => ({
      id: row.id,
      titulo: row.title,
      title: row.title,
      fecha: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : null,
      texto: row.content,
      content: row.content,
      url: row.file_url,
      file_url: row.file_url,
      categoria: row.category,
      category: row.category,
      global: !row.created_by,
      owner: row.created_by
    }));
    
    res.json(guias);
  } catch (err) {
    console.error('Error getting guias:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.saveGuia = async (req, res) => {
  try {
    const { id, titulo, title, texto, content, url, file_url, categoria, category, global } = req.body;
    
    const guiaTitle = titulo || title;
    const guiaContent = texto || content;
    const guiaUrl = url || file_url;
    const guiaCategory = categoria || category;
    const createdBy = (req.session.user.role === 'admin' && global) ? null : req.session.user.username;
    
    if (id) {
      const result = await query(
        `UPDATE guias SET title = $1, content = $2, file_url = $3, category = $4, created_by = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 RETURNING *`,
        [guiaTitle, guiaContent, guiaUrl, guiaCategory, createdBy, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({error: 'Guía no encontrada'});
      }
      
      res.json({success: true, guia: result.rows[0]});
    } else {
      const result = await query(
        `INSERT INTO guias (title, content, file_url, category, created_by, active)
         VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
        [guiaTitle, guiaContent, guiaUrl, guiaCategory, createdBy]
      );
      res.json({success: true, guia: result.rows[0]});
    }
  } catch (err) {
    console.error('Error saving guia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.deleteGuia = async (req, res) => {
  try {
    const {id} = req.params;
    
    let sql = 'DELETE FROM guias WHERE id = $1';
    const params = [id];
    
    if (req.session.user.role !== 'admin') {
      sql += ' AND created_by = $2';
      params.push(req.session.user.username);
    }
    
    await query(sql, params);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting guia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
