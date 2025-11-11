const crypto = require('crypto');
const { readJSON, writeJSON } = require('../services/fileService');

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

module.exports = exports;
