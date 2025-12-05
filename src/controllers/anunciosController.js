const { query } = require('../services/dbService');

exports.getAnuncios = async (req, res) => {
  try {
    let result;
    
    if (req.session.user.role === 'admin') {
      result = await query('SELECT * FROM anuncios WHERE active = true ORDER BY priority DESC, created_at DESC');
    } else {
      result = await query(
        'SELECT * FROM anuncios WHERE active = true AND (created_by IS NULL OR created_by = $1) ORDER BY priority DESC, created_at DESC',
        [req.session.user.username]
      );
    }
    
    const anuncios = result.rows.map(row => ({
      id: row.id,
      titulo: row.title,
      title: row.title,
      fecha: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : null,
      texto: row.content,
      content: row.content,
      img: '',
      global: !row.created_by,
      type: row.type,
      priority: row.priority,
      owner: row.created_by
    }));
    
    res.json(anuncios);
  } catch (err) {
    console.error('Error getting anuncios:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.saveAnuncio = async (req, res) => {
  try {
    const { id, titulo, title, texto, content, type, priority, global } = req.body;
    
    const anuncioTitle = titulo || title;
    const anuncioContent = texto || content;
    const createdBy = (req.session.user.role === 'admin' && global) ? null : req.session.user.username;
    
    if (id) {
      const result = await query(
        `UPDATE anuncios SET title = $1, content = $2, type = $3, priority = $4, created_by = $5
         WHERE id = $6 RETURNING *`,
        [anuncioTitle, anuncioContent, type || 'info', priority || 0, createdBy, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({error: 'Anuncio no encontrado'});
      }
      
      res.json({success: true, anuncio: result.rows[0]});
    } else {
      const result = await query(
        `INSERT INTO anuncios (title, content, type, priority, created_by, active)
         VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
        [anuncioTitle, anuncioContent, type || 'info', priority || 0, createdBy]
      );
      res.json({success: true, anuncio: result.rows[0]});
    }
  } catch (err) {
    console.error('Error saving anuncio:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.deleteAnuncio = async (req, res) => {
  try {
    const {id} = req.params;
    
    let sql = 'DELETE FROM anuncios WHERE id = $1';
    const params = [id];
    
    if (req.session.user.role !== 'admin') {
      sql += ' AND created_by = $2';
      params.push(req.session.user.username);
    }
    
    await query(sql, params);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting anuncio:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
