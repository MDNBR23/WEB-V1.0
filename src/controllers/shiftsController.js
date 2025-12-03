const { pool } = require('../config/database');
const { readJSON, writeJSON } = require('../services/fileService');

exports.getShifts = async (req, res) => {
  try {
    console.log('GET /api/shifts - Session:', req.session);
    console.log('Session ID:', req.sessionID);
    console.log('User ID from session:', req.session?.userId);
    
    if (!req.session || !req.session.userId) {
      console.error('GET /api/shifts - No session or userId found');
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { startDate, endDate } = req.query;
    
    try {
      let query = 'SELECT * FROM shifts WHERE user_id = $1';
      const params = [req.session.userId];
      
      if (startDate && endDate) {
        query += ' AND shift_date BETWEEN $2 AND $3';
        params.push(startDate, endDate);
      }
      
      query += ' ORDER BY shift_date DESC';
      
      const result = await pool.query(query, params);
      const shifts = result.rows.map(shift => ({
        ...shift,
        shift_date: shift.shift_date instanceof Date 
          ? shift.shift_date.toISOString().slice(0, 10)
          : (shift.shift_date || '').toString().slice(0, 10)
      }));
      return res.json({ shifts });
    } catch (dbError) {
      console.log('PostgreSQL no disponible, usando JSON local');
      const shifts = await readJSON('shifts.json', []);
      let userShifts = shifts.filter(s => s.user_id === req.session.userId);
      
      if (startDate && endDate) {
        userShifts = userShifts.filter(s => s.shift_date >= startDate && s.shift_date <= endDate);
      }
      
      userShifts.sort((a, b) => new Date(b.shift_date) - new Date(a.shift_date));
      res.json({ shifts: userShifts });
    }
  } catch (err) {
    console.error('Error fetching shifts:', err);
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
};

exports.createShift = async (req, res) => {
  try {
    console.log('POST /api/shifts - Session:', req.session);
    console.log('Session ID:', req.sessionID);
    console.log('User ID from session:', req.session?.userId);
    
    if (!req.session || !req.session.userId) {
      console.error('No session or userId found');
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { entity_name, shift_date, shift_type, hours, hourly_rate, notes, currency } = req.body;
    
    try {
      const result = await pool.query(
        `INSERT INTO shifts (user_id, entity_name, shift_date, shift_type, hours, hourly_rate, notes, currency)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [req.session.userId, entity_name, shift_date, shift_type, hours || 0, hourly_rate || 0, notes || '', currency || 'COP']
      );
      
      console.log('Shift created successfully for user:', req.session.userId);
      const shift = {
        ...result.rows[0],
        shift_date: result.rows[0].shift_date instanceof Date
          ? result.rows[0].shift_date.toISOString().slice(0, 10)
          : (result.rows[0].shift_date || '').toString().slice(0, 10)
      };
      return res.json({ shift, success: true });
    } catch (dbError) {
      console.log('PostgreSQL no disponible, guardando en JSON local');
      const shifts = await readJSON('shifts.json', []);
      const newShift = {
        id: shifts.length > 0 ? Math.max(...shifts.map(s => s.id)) + 1 : 1,
        user_id: req.session.userId,
        entity_name,
        shift_date,
        shift_type,
        hours: hours || 0,
        hourly_rate: hourly_rate || 0,
        notes: notes || '',
        currency: currency || 'COP',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      shifts.push(newShift);
      await writeJSON('shifts.json', shifts);
      
      console.log('Shift created in JSON for user:', req.session.userId);
      res.json({ shift: newShift, success: true });
    }
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
    
    try {
      const result = await pool.query(
        `UPDATE shifts 
         SET entity_name = $1, shift_date = $2, shift_type = $3, hours = $4, hourly_rate = $5, notes = $6, currency = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 AND user_id = $9 RETURNING *`,
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
      return res.json({ shift, success: true });
    } catch (dbError) {
      console.log('PostgreSQL no disponible, actualizando en JSON local');
      const shifts = await readJSON('shifts.json', []);
      const shiftIndex = shifts.findIndex(s => s.id === parseInt(id) && s.user_id === req.session.userId);
      
      if (shiftIndex === -1) {
        return res.status(404).json({ error: 'Turno no encontrado' });
      }
      
      shifts[shiftIndex] = {
        ...shifts[shiftIndex],
        entity_name,
        shift_date,
        shift_type,
        hours: hours || 0,
        hourly_rate: hourly_rate || 0,
        notes: notes || '',
        currency: currency || 'COP',
        updated_at: new Date().toISOString()
      };
      
      await writeJSON('shifts.json', shifts);
      console.log('Shift updated in JSON for user:', req.session.userId);
      res.json({ shift: shifts[shiftIndex], success: true });
    }
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
    
    try {
      const result = await pool.query(
        'DELETE FROM shifts WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, req.session.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Turno no encontrado' });
      }
      
      return res.json({ success: true });
    } catch (dbError) {
      console.log('PostgreSQL no disponible, eliminando de JSON local');
      const shifts = await readJSON('shifts.json', []);
      const initialLength = shifts.length;
      const filteredShifts = shifts.filter(s => !(s.id === parseInt(id) && s.user_id === req.session.userId));
      
      if (filteredShifts.length === initialLength) {
        return res.status(404).json({ error: 'Turno no encontrado' });
      }
      
      await writeJSON('shifts.json', filteredShifts);
      console.log('Shift deleted from JSON for user:', req.session.userId);
      res.json({ success: true });
    }
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
    
    try {
      let query = 'DELETE FROM shifts WHERE user_id = $1';
      const params = [req.session.userId];
      let paramIndex = 2;
      
      if (ids && ids.length > 0) {
        query += ` AND id = ANY($${paramIndex})`;
        params.push(ids);
        paramIndex++;
      }
      
      if (startDate && endDate) {
        query += ` AND shift_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(startDate, endDate);
        paramIndex += 2;
      }
      
      if (shiftTypes && shiftTypes.length > 0) {
        query += ` AND shift_type = ANY($${paramIndex})`;
        params.push(shiftTypes);
        paramIndex++;
      }
      
      query += ' RETURNING id';
      
      const result = await pool.query(query, params);
      
      return res.json({ 
        success: true, 
        deletedCount: result.rows.length,
        deletedIds: result.rows.map(r => r.id)
      });
    } catch (dbError) {
      console.log('PostgreSQL no disponible, eliminando de JSON local');
      const shifts = await readJSON('shifts.json', []);
      let filteredShifts = shifts.filter(s => {
        if (s.user_id !== req.session.userId) return true;
        
        if (ids && ids.length > 0 && !ids.includes(s.id)) return true;
        if (startDate && endDate && (s.shift_date < startDate || s.shift_date > endDate)) return true;
        if (shiftTypes && shiftTypes.length > 0 && !shiftTypes.includes(s.shift_type)) return true;
        
        return false;
      });
      
      const deletedCount = shifts.length - filteredShifts.length;
      await writeJSON('shifts.json', filteredShifts);
      
      res.json({ 
        success: true, 
        deletedCount,
        message: `${deletedCount} turno(s) eliminado(s)` 
      });
    }
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
    
    try {
      let query = `
        SELECT 
          currency,
          entity_name,
          COUNT(*) as shift_count,
          SUM(hours) as total_hours,
          SUM(hours * hourly_rate) as total_amount,
          AVG(hourly_rate) as avg_rate
        FROM shifts 
        WHERE user_id = $1`;
      
      const params = [req.session.userId];
      
      if (startDate && endDate) {
        query += ' AND shift_date BETWEEN $2 AND $3';
        params.push(startDate, endDate);
      }
      
      query += ' GROUP BY currency, entity_name ORDER BY currency, total_amount DESC';
      
      const result = await pool.query(query, params);
      
      const totalQuery = `
        SELECT 
          currency,
          COUNT(*) as total_shifts,
          SUM(hours) as total_hours,
          SUM(hours * hourly_rate) as total_amount
        FROM shifts 
        WHERE user_id = $1` + (startDate && endDate ? ' AND shift_date BETWEEN $2 AND $3' : '') + ' GROUP BY currency ORDER BY currency';
      
      const totalResult = await pool.query(totalQuery, params);
      
      const currencies = [...new Set(totalResult.rows.map(r => r.currency))];
      const singleCurrency = currencies.length === 1;
      
      return res.json({ 
        byEntity: result.rows,
        totals: totalResult.rows,
        currencies,
        singleCurrency
      });
    } catch (dbError) {
      console.log('PostgreSQL no disponible, usando JSON local');
      const shifts = await readJSON('shifts.json', []);
      let userShifts = shifts.filter(s => s.user_id === req.session.userId);
      
      if (startDate && endDate) {
        userShifts = userShifts.filter(s => s.shift_date >= startDate && s.shift_date <= endDate);
      }
      
      const byEntityMap = {};
      userShifts.forEach(shift => {
        const currency = shift.currency || 'COP';
        const entity = shift.entity_name;
        const key = `${currency}|||${entity}`;
        
        if (!byEntityMap[key]) {
          byEntityMap[key] = {
            currency,
            entity_name: entity,
            shift_count: 0,
            total_hours: 0,
            total_amount: 0,
            rate_sum: 0
          };
        }
        
        byEntityMap[key].shift_count++;
        byEntityMap[key].total_hours += parseFloat(shift.hours || 0);
        byEntityMap[key].total_amount += parseFloat(shift.hours || 0) * parseFloat(shift.hourly_rate || 0);
        byEntityMap[key].rate_sum += parseFloat(shift.hourly_rate || 0);
      });
      
      const byEntity = Object.values(byEntityMap).map(item => ({
        ...item,
        avg_rate: item.shift_count > 0 ? item.rate_sum / item.shift_count : 0
      }));
      
      const totalsByCurrency = {};
      userShifts.forEach(shift => {
        const currency = shift.currency || 'COP';
        if (!totalsByCurrency[currency]) {
          totalsByCurrency[currency] = {
            currency,
            total_shifts: 0,
            total_hours: 0,
            total_amount: 0
          };
        }
        
        totalsByCurrency[currency].total_shifts++;
        totalsByCurrency[currency].total_hours += parseFloat(shift.hours || 0);
        totalsByCurrency[currency].total_amount += parseFloat(shift.hours || 0) * parseFloat(shift.hourly_rate || 0);
      });
      
      const totals = Object.values(totalsByCurrency);
      const currencies = [...new Set(totals.map(t => t.currency))];
      const singleCurrency = currencies.length === 1;
      
      res.json({ 
        byEntity,
        totals,
        currencies,
        singleCurrency
      });
    }
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
    
    const result = await pool.query(
      'SELECT * FROM shift_config WHERE user_id = $1',
      [req.session.userId]
    );
    
    if (result.rows.length === 0) {
      const defaultConfig = await pool.query(
        `INSERT INTO shift_config (user_id, ops_enabled, ops_frequency_days, ops_hours, ops_hourly_rate)
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
    
    const result = await pool.query(
      `INSERT INTO shift_config (user_id, ops_enabled, ops_frequency_days, ops_entity_name, ops_hours, ops_hourly_rate)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) 
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
    
    const config = await pool.query(
      'SELECT * FROM shift_config WHERE user_id = $1',
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
        user_id: req.session.userId,
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
        await pool.query(
          `INSERT INTO shifts (user_id, entity_name, shift_date, shift_type, hours, hourly_rate, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [shift.user_id, shift.entity_name, shift.shift_date, shift.shift_type, shift.hours, shift.hourly_rate, shift.notes]
        );
      }
      
      await pool.query(
        'UPDATE shift_config SET last_ops_date = $1 WHERE user_id = $2',
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
