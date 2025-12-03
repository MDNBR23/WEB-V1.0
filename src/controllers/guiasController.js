const crypto = require('crypto');
const { readJSON, writeJSON } = require('../services/fileService');

exports.getGuias = async (req, res) => {
  try {
    const globalGuias = await readJSON('guias_global.json', []);
    
    if (req.session.user.role === 'admin') {
      return res.json(globalGuias);
    }
    
    const userGuias = await readJSON(`guias_${req.session.user.username}.json`, []);
    const combined = [...globalGuias, ...userGuias];
    res.json(combined);
  } catch (err) {
    console.error('Error getting guias:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.saveGuia = async (req, res) => {
  try {
    const guia = {
      ...req.body,
      id: req.body.id || crypto.randomUUID(),
      owner: req.session.user.username
    };
    
    if (req.session.user.role === 'admin' && req.body.global) {
      const globalGuias = await readJSON('guias_global.json', []);
      const index = globalGuias.findIndex(g => g.id === guia.id);
      if (index >= 0) {
        globalGuias[index] = guia;
      } else {
        globalGuias.push(guia);
      }
      await writeJSON('guias_global.json', globalGuias);
    } else {
      const userGuias = await readJSON(`guias_${req.session.user.username}.json`, []);
      const index = userGuias.findIndex(g => g.id === guia.id);
      if (index >= 0) {
        userGuias[index] = guia;
      } else {
        userGuias.push(guia);
      }
      await writeJSON(`guias_${req.session.user.username}.json`, userGuias);
    }
    
    res.json({success: true, guia});
  } catch (err) {
    console.error('Error saving guia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.deleteGuia = async (req, res) => {
  try {
    const {id} = req.params;
    
    if (req.session.user.role === 'admin') {
      const globalGuias = await readJSON('guias_global.json', []);
      const filtered = globalGuias.filter(g => g.id !== id);
      await writeJSON('guias_global.json', filtered);
    }
    
    const userGuias = await readJSON(`guias_${req.session.user.username}.json`, []);
    const filtered = userGuias.filter(g => g.id !== id);
    await writeJSON(`guias_${req.session.user.username}.json`, filtered);
    
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting guia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
