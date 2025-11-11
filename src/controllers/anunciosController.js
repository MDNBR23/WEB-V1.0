const crypto = require('crypto');
const { readJSON, writeJSON } = require('../services/fileService');

exports.getAnuncios = async (req, res) => {
  try {
    const globalAnuncios = await readJSON('anuncios_global.json', []);
    
    if (req.session.user.role === 'admin') {
      return res.json(globalAnuncios);
    }
    
    const userAnuncios = await readJSON(`anuncios_${req.session.user.username}.json`, []);
    const combined = [...globalAnuncios, ...userAnuncios];
    res.json(combined);
  } catch (err) {
    console.error('Error getting anuncios:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.saveAnuncio = async (req, res) => {
  try {
    const anuncio = {
      ...req.body,
      id: req.body.id || crypto.randomUUID(),
      owner: req.session.user.username
    };
    
    if (req.session.user.role === 'admin' && req.body.global) {
      const globalAnuncios = await readJSON('anuncios_global.json', []);
      const index = globalAnuncios.findIndex(a => a.id === anuncio.id);
      if (index >= 0) {
        globalAnuncios[index] = anuncio;
      } else {
        globalAnuncios.push(anuncio);
      }
      await writeJSON('anuncios_global.json', globalAnuncios);
    } else {
      const userAnuncios = await readJSON(`anuncios_${req.session.user.username}.json`, []);
      const index = userAnuncios.findIndex(a => a.id === anuncio.id);
      if (index >= 0) {
        userAnuncios[index] = anuncio;
      } else {
        userAnuncios.push(anuncio);
      }
      await writeJSON(`anuncios_${req.session.user.username}.json`, userAnuncios);
    }
    
    res.json({success: true, anuncio});
  } catch (err) {
    console.error('Error saving anuncio:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.deleteAnuncio = async (req, res) => {
  try {
    const {id} = req.params;
    
    if (req.session.user.role === 'admin') {
      const globalAnuncios = await readJSON('anuncios_global.json', []);
      const filtered = globalAnuncios.filter(a => a.id !== id);
      await writeJSON('anuncios_global.json', filtered);
    }
    
    const userAnuncios = await readJSON(`anuncios_${req.session.user.username}.json`, []);
    const filtered = userAnuncios.filter(a => a.id !== id);
    await writeJSON(`anuncios_${req.session.user.username}.json`, filtered);
    
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting anuncio:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

module.exports = exports;
