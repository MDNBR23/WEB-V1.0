const { query } = require('../services/dbService');

exports.getMedications = async (req, res) => {
  try {
    const result = await query('SELECT * FROM medications ORDER BY name ASC');
    const meds = result.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      name: row.name,
      grupo: row.category,
      category: row.category,
      dilucion: row.dosage,
      dosage: row.dosage,
      comentarios: row.notes,
      notes: row.notes,
      indications: row.indications,
      contraindications: row.contraindications,
      side_effects: row.side_effects
    }));
    res.json(meds);
  } catch (err) {
    console.error('Error getting medications:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.saveMedication = async (req, res) => {
  try {
    const { id, nombre, name, grupo, category, dilucion, dosage, comentarios, notes, indications, contraindications, side_effects } = req.body;
    
    const medName = nombre || name;
    const medCategory = grupo || category;
    const medDosage = dilucion || dosage;
    const medNotes = comentarios || notes;
    
    if (id) {
      const result = await query(
        `UPDATE medications SET name = $1, category = $2, dosage = $3, notes = $4, 
         indications = $5, contraindications = $6, side_effects = $7, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $8 RETURNING *`,
        [medName, medCategory, medDosage, medNotes, indications, contraindications, side_effects, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({error: 'Medicamento no encontrado'});
      }
      
      res.json({success: true, medication: result.rows[0]});
    } else {
      const result = await query(
        `INSERT INTO medications (name, category, dosage, notes, indications, contraindications, side_effects)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [medName, medCategory, medDosage, medNotes, indications, contraindications, side_effects]
      );
      res.json({success: true, medication: result.rows[0]});
    }
  } catch (err) {
    console.error('Error saving medication:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.deleteMedication = async (req, res) => {
  try {
    const {id} = req.params;
    await query('DELETE FROM medications WHERE id = $1', [id]);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting medication:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.getInfusionMedications = async (req, res) => {
  try {
    const result = await query('SELECT * FROM infusion_medications ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting infusion medications:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.createInfusionMedication = async (req, res) => {
  try {
    const { nombre, dosis, unidad, grupo, comentarios } = req.body;
    const result = await query(
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
    const result = await query(
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
    await query('DELETE FROM infusion_medications WHERE id = $1', [id]);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting infusion medication:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.getPresentations = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const result = await query(
      'SELECT * FROM medication_presentations WHERE medication_id = $1 ORDER BY id ASC',
      [medicationId]
    );
    const presentations = result.rows.map(row => {
      let diluciones = row.diluciones;
      
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
    const result = await query(
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
    const result = await query(
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
    await query('DELETE FROM medication_presentations WHERE id = $1', [id]);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting presentation:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
