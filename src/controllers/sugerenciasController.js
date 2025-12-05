const { query } = require('../services/dbService');

exports.getSugerencias = async (req, res) => {
  try {
    let result;
    
    if (req.session.user.role === 'admin') {
      result = await query('SELECT * FROM sugerencias ORDER BY created_at DESC');
    } else {
      result = await query(
        'SELECT * FROM sugerencias WHERE username = $1 ORDER BY created_at DESC',
        [req.session.user.username]
      );
    }
    
    const sugerencias = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      mensaje: row.content,
      content: row.content,
      respuesta: row.response,
      response: row.response,
      fecha: row.created_at ? new Date(row.created_at).toISOString() : null,
      fechaRespuesta: row.updated_at ? new Date(row.updated_at).toISOString() : null,
      respondida: row.status === 'respondida',
      status: row.status,
      vista: row.status === 'vista'
    }));
    
    res.json(sugerencias);
  } catch (err) {
    console.error('Error getting sugerencias:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.createSugerencia = async (req, res) => {
  try {
    const result = await query(
      `INSERT INTO sugerencias (username, content, status)
       VALUES ($1, $2, 'pendiente') RETURNING *`,
      [req.session.user.username, req.body.mensaje]
    );
    
    const row = result.rows[0];
    const sugerencia = {
      id: row.id,
      username: row.username,
      mensaje: row.content,
      respuesta: '',
      fecha: new Date(row.created_at).toISOString(),
      respondida: false,
      vista: false
    };
    
    res.json({success: true, sugerencia});
  } catch (err) {
    console.error('Error saving sugerencia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.updateSugerencia = async (req, res) => {
  try {
    const {id} = req.params;
    const {respuesta} = req.body;
    
    const result = await query(
      `UPDATE sugerencias SET response = $1, status = 'respondida', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [respuesta, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Sugerencia no encontrada'});
    }
    
    const row = result.rows[0];
    const sugerencia = {
      id: row.id,
      username: row.username,
      mensaje: row.content,
      respuesta: row.response,
      fecha: new Date(row.created_at).toISOString(),
      fechaRespuesta: new Date(row.updated_at).toISOString(),
      respondida: true,
      vista: false
    };
    
    res.json({success: true, sugerencia});
  } catch (err) {
    console.error('Error updating sugerencia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.deleteSugerencia = async (req, res) => {
  try {
    const {id} = req.params;
    await query('DELETE FROM sugerencias WHERE id = $1', [id]);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting sugerencia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.markAsSeen = async (req, res) => {
  try {
    await query(
      `UPDATE sugerencias SET status = 'vista' 
       WHERE username = $1 AND status = 'respondida'`,
      [req.session.user.username]
    );
    
    res.json({success: true});
  } catch (err) {
    console.error('Error marking sugerencias as seen:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.getCount = async (req, res) => {
  try {
    const result = await query(
      `SELECT COUNT(*) as count FROM sugerencias WHERE status = 'pendiente'`
    );
    res.json({count: parseInt(result.rows[0].count)});
  } catch (err) {
    console.error('Error counting sugerencias:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
