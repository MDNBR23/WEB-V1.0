const { query } = require('../services/dbService');

exports.getShifts = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { startDate, endDate } = req.query;
    
    let sql = 'SELECT * FROM shifts WHERE username = $1';
    const params = [req.session.userId];
    
    if (startDate && endDate) {
      sql += ' AND shift_date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }
    
    sql += ' ORDER BY shift_date DESC';
    
    const result = await query(sql, params);
    const shifts = result.rows.map(shift => ({
      ...shift,
      shift_date: shift.shift_date instanceof Date 
        ? shift.shift_date.toISOString().slice(0, 10)
        : (shift.shift_date || '').toString().slice(0, 10)
    }));
    
    res.json({ shifts });
  } catch (err) {
    console.error('Error fetching shifts:', err);
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
};

exports.createShift = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { entity_name, shift_date, shift_type, hours, hourly_rate, notes, currency } = req.body;
    
    const result = await query(
      `INSERT INTO shifts (username, entity_name, shift_date, shift_type, hours, hourly_rate, notes, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.session.userId, entity_name, shift_date, shift_type, hours || 0, hourly_rate || 0, notes || '', currency || 'COP']
    );
    
    const shift = {
      ...result.rows[0],
      shift_date: result.rows[0].shift_date instanceof Date
        ? result.rows[0].shift_date.toISOString().slice(0, 10)
        : (result.rows[0].shift_date || '').toString().slice(0, 10)
    };
    
    res.json({ shift, success: true });
  } catch (err) {
    console.error('Error creating shift:', err);
    res.status(500).json({ error: 'Error al crear turno' });
  }
};

exports.updateShift = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { id } = req.params;
    const { entity_name, shift_date, shift_type, hours, hourly_rate, notes, currency } = req.body;
    
    const result = await query(
      `UPDATE shifts 
       SET entity_name = $1, shift_date = $2, shift_type = $3, hours = $4, hourly_rate = $5, notes = $6, currency = $7
       WHERE id = $8 AND username = $9 RETURNING *`,
      [entity_name, shift_date, shift_type, hours, hourly_rate, notes, currency || 'COP', id, req.session.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    
    const shift = {
      ...result.rows[0],
      shift_date: result.rows[0].shift_date instanceof Date
        ? result.rows[0].shift_date.toISOString().slice(0, 10)
        : (result.rows[0].shift_date || '').toString().slice(0, 10)
    };
    
    res.json({ shift, success: true });
  } catch (err) {
    console.error('Error updating shift:', err);
    res.status(500).json({ error: 'Error al actualizar turno' });
  }
};

exports.deleteShift = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM shifts WHERE id = $1 AND username = $2 RETURNING id',
      [id, req.session.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting shift:', err);
    res.status(500).json({ error: 'Error al eliminar turno' });
  }
};

exports.deleteBulk = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { ids, startDate, endDate, shiftTypes } = req.body;
    
    let sql = 'DELETE FROM shifts WHERE username = $1';
    const params = [req.session.userId];
    let paramIndex = 2;
    
    if (ids && ids.length > 0) {
      sql += ` AND id = ANY($${paramIndex})`;
      params.push(ids);
      paramIndex++;
    }
    
    if (startDate && endDate) {
      sql += ` AND shift_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }
    
    if (shiftTypes && shiftTypes.length > 0) {
      sql += ` AND shift_type = ANY($${paramIndex})`;
      params.push(shiftTypes);
      paramIndex++;
    }
    
    sql += ' RETURNING id';
    
    const result = await query(sql, params);
    
    res.json({ 
      success: true, 
      deletedCount: result.rows.length,
      deletedIds: result.rows.map(r => r.id)
    });
  } catch (err) {
    console.error('Error deleting shifts in bulk:', err);
    res.status(500).json({ error: 'Error al eliminar turnos' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { startDate, endDate } = req.query;
    
    let sql = `
      SELECT 
        currency,
        entity_name,
        COUNT(*) as shift_count,
        SUM(hours) as total_hours,
        SUM(hours * hourly_rate) as total_amount,
        AVG(hourly_rate) as avg_rate
      FROM shifts 
      WHERE username = $1`;
    
    const params = [req.session.userId];
    
    if (startDate && endDate) {
      sql += ' AND shift_date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }
    
    sql += ' GROUP BY currency, entity_name ORDER BY currency, total_amount DESC';
    
    const result = await query(sql, params);
    
    let totalSql = `
      SELECT 
        currency,
        COUNT(*) as total_shifts,
        SUM(hours) as total_hours,
        SUM(hours * hourly_rate) as total_amount
      FROM shifts 
      WHERE username = $1` + (startDate && endDate ? ' AND shift_date BETWEEN $2 AND $3' : '') + ' GROUP BY currency ORDER BY currency';
    
    const totalResult = await query(totalSql, params);
    
    const currencies = [...new Set(totalResult.rows.map(r => r.currency))];
    const singleCurrency = currencies.length === 1;
    
    res.json({ 
      byEntity: result.rows,
      totals: totalResult.rows,
      currencies,
      singleCurrency
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
};

exports.getConfig = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const result = await query(
      'SELECT * FROM shift_config WHERE username = $1',
      [req.session.userId]
    );
    
    if (result.rows.length === 0) {
      const defaultConfig = await query(
        `INSERT INTO shift_config (username, ops_enabled, ops_frequency_days, ops_hours, ops_hourly_rate)
         VALUES ($1, false, 7, 12, 0) RETURNING *`,
        [req.session.userId]
      );
      return res.json({ config: defaultConfig.rows[0] });
    }
    
    res.json({ config: result.rows[0] });
  } catch (err) {
    console.error('Error fetching config:', err);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

exports.saveConfig = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { ops_enabled, ops_frequency_days, ops_entity_name, ops_hours, ops_hourly_rate } = req.body;
    
    const result = await query(
      `INSERT INTO shift_config (username, ops_enabled, ops_frequency_days, ops_entity_name, ops_hours, ops_hourly_rate)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (username) 
       DO UPDATE SET 
         ops_enabled = $2,
         ops_frequency_days = $3,
         ops_entity_name = $4,
         ops_hours = $5,
         ops_hourly_rate = $6,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.session.userId, ops_enabled, ops_frequency_days, ops_entity_name, ops_hours, ops_hourly_rate]
    );
    
    res.json({ config: result.rows[0], success: true });
  } catch (err) {
    console.error('Error updating config:', err);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};

exports.generateOps = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const config = await query(
      'SELECT * FROM shift_config WHERE username = $1',
      [req.session.userId]
    );
    
    if (config.rows.length === 0 || !config.rows[0].ops_enabled) {
      return res.status(400).json({ error: 'OPS no está habilitado' });
    }
    
    const cfg = config.rows[0];
    const lastDate = cfg.last_ops_date ? new Date(cfg.last_ops_date) : new Date();
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + cfg.ops_frequency_days);
    
    const today = new Date();
    const shiftsToCreate = [];
    
    while (nextDate <= today) {
      shiftsToCreate.push({
        username: req.session.userId,
        entity_name: cfg.ops_entity_name || 'OPS',
        shift_date: nextDate.toISOString().split('T')[0],
        shift_type: 'OPS',
        hours: cfg.ops_hours,
        hourly_rate: cfg.ops_hourly_rate,
        notes: 'Generado automáticamente'
      });
      nextDate.setDate(nextDate.getDate() + cfg.ops_frequency_days);
    }
    
    if (shiftsToCreate.length > 0) {
      for (const shift of shiftsToCreate) {
        await query(
          `INSERT INTO shifts (username, entity_name, shift_date, shift_type, hours, hourly_rate, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [shift.username, shift.entity_name, shift.shift_date, shift.shift_type, shift.hours, shift.hourly_rate, shift.notes]
        );
      }
      
      await query(
        'UPDATE shift_config SET last_ops_date = $1 WHERE username = $2',
        [shiftsToCreate[shiftsToCreate.length - 1].shift_date, req.session.userId]
      );
    }
    
    res.json({ success: true, generated: shiftsToCreate.length, shifts: shiftsToCreate });
  } catch (err) {
    console.error('Error generating OPS shifts:', err);
    res.status(500).json({ error: 'Error al generar turnos OPS' });
  }
};

module.exports = exports;
