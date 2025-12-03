const crypto = require('crypto');
const { readJSON, writeJSON } = require('../services/fileService');

exports.getSugerencias = async (req, res) => {
  try {
    if (req.session.user.role === 'admin') {
      const suggestions = await readJSON('sugerencias.json', []);
      res.json(suggestions);
    } else {
      const suggestions = await readJSON('sugerencias.json', []);
      const userSuggestions = suggestions.filter(s => s.username === req.session.user.username);
      res.json(userSuggestions);
    }
  } catch (err) {
    console.error('Error getting sugerencias:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.createSugerencia = async (req, res) => {
  try {
    const suggestions = await readJSON('sugerencias.json', []);
    
    const newSuggestion = {
      id: crypto.randomUUID(),
      username: req.session.user.username,
      mensaje: req.body.mensaje,
      respuesta: '',
      fecha: new Date().toISOString(),
      respondida: false,
      vista: false
    };
    
    suggestions.push(newSuggestion);
    await writeJSON('sugerencias.json', suggestions);
    
    res.json({success: true, sugerencia: newSuggestion});
  } catch (err) {
    console.error('Error saving sugerencia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.updateSugerencia = async (req, res) => {
  try {
    const {id} = req.params;
    const {respuesta} = req.body;
    
    const suggestions = await readJSON('sugerencias.json', []);
    const index = suggestions.findIndex(s => s.id === id);
    
    if (index >= 0) {
      suggestions[index].respuesta = respuesta;
      suggestions[index].respondida = true;
      suggestions[index].vista = false;
      suggestions[index].fechaRespuesta = new Date().toISOString();
      await writeJSON('sugerencias.json', suggestions);
      res.json({success: true, sugerencia: suggestions[index]});
    } else {
      res.status(404).json({error: 'Sugerencia no encontrada'});
    }
  } catch (err) {
    console.error('Error updating sugerencia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.deleteSugerencia = async (req, res) => {
  try {
    const {id} = req.params;
    const suggestions = await readJSON('sugerencias.json', []);
    const filtered = suggestions.filter(s => s.id !== id);
    
    await writeJSON('sugerencias.json', filtered);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting sugerencia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.markAsSeen = async (req, res) => {
  try {
    const suggestions = await readJSON('sugerencias.json', []);
    let modified = false;
    
    suggestions.forEach(s => {
      if (s.username === req.session.user.username && s.respondida && !s.vista) {
        s.vista = true;
        modified = true;
      }
    });
    
    if (modified) {
      await writeJSON('sugerencias.json', suggestions);
    }
    
    res.json({success: true});
  } catch (err) {
    console.error('Error marking sugerencias as seen:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.getCount = async (req, res) => {
  try {
    const suggestions = await readJSON('sugerencias.json', []);
    const pendientes = suggestions.filter(s => !s.respondida).length;
    res.json({count: pendientes});
  } catch (err) {
    console.error('Error counting sugerencias:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
