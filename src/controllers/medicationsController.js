const crypto = require('crypto');
const { readJSON, writeJSON } = require('../services/fileService');
const { pool } = require('../config/database');

exports.getMedications = async (req, res) => {
  try {
    const meds = await readJSON('medications.json', []);
    res.json(meds);
  } catch (err) {
    console.error('Error getting medications:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.saveMedication = async (req, res) => {
  try {
    const med = {
      ...req.body,
      id: req.body.id || crypto.randomUUID()
    };
    
    const meds = await readJSON('medications.json', []);
    const index = meds.findIndex(m => m.id === med.id);
    if (index >= 0) {
      meds[index] = med;
    } else {
      meds.push(med);
    }
    
    await writeJSON('medications.json', meds);
    res.json({success: true, medication: med});
  } catch (err) {
    console.error('Error saving medication:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.deleteMedication = async (req, res) => {
  try {
    const {id} = req.params;
    const meds = await readJSON('medications.json', []);
    const filtered = meds.filter(m => m.id !== id);
    
    await writeJSON('medications.json', filtered);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting medication:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

// Infusion Medications
exports.getInfusionMedications = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM infusion_medications ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting infusion medications:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.createInfusionMedication = async (req, res) => {
  try {
    const { nombre, dosis, unidad, grupo, comentarios } = req.body;
    const result = await pool.query(
      'INSERT INTO infusion_medications (nombre, dosis, unidad, grupo, comentarios) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, dosis, unidad, grupo, comentarios]
    );
    res.json({success: true, medication: result.rows[0]});
  } catch (err) {
    console.error('Error creating infusion medication:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.updateInfusionMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, dosis, unidad, grupo, comentarios } = req.body;
    const result = await pool.query(
      'UPDATE infusion_medications SET nombre = $1, dosis = $2, unidad = $3, grupo = $4, comentarios = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [nombre, dosis, unidad, grupo, comentarios, id]
    );
    res.json({success: true, medication: result.rows[0]});
  } catch (err) {
    console.error('Error updating infusion medication:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.deleteInfusionMedication = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM infusion_medications WHERE id = $1', [id]);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting infusion medication:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

// Presentations
exports.getPresentations = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const result = await pool.query(
      'SELECT * FROM medication_presentations WHERE medication_id = $1 ORDER BY id ASC',
      [medicationId]
    );
    const presentations = result.rows.map(row => {
      let diluciones = row.diluciones;
      
      // Parse diluciones
      if (typeof diluciones === 'string') {
        try {
          diluciones = JSON.parse(diluciones);
        } catch {
          diluciones = [];
        }
      }
      
      return {
        ...row,
        diluciones,
        concentracion: parseFloat(row.concentracion) || 0
      };
    });
    res.json(presentations);
  } catch (err) {
    console.error('Error getting presentations:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.createPresentation = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const { descripcion, concentracion, diluciones } = req.body;
    const result = await pool.query(
      'INSERT INTO medication_presentations (medication_id, descripcion, concentracion, diluciones) VALUES ($1, $2, $3, $4) RETURNING *',
      [medicationId, descripcion, concentracion, JSON.stringify(diluciones)]
    );
    const row = result.rows[0];
    res.json({success: true, presentation: {...row, diluciones: JSON.parse(row.diluciones)}});
  } catch (err) {
    console.error('Error creating presentation:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.updatePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, concentracion, diluciones } = req.body;
    const result = await pool.query(
      'UPDATE medication_presentations SET descripcion = $1, concentracion = $2, diluciones = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [descripcion, concentracion, JSON.stringify(diluciones), id]
    );
    const row = result.rows[0];
    res.json({success: true, presentation: {...row, diluciones: JSON.parse(row.diluciones)}});
  } catch (err) {
    console.error('Error updating presentation:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.deletePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM medication_presentations WHERE id = $1', [id]);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting presentation:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
