const express = require('express');
const router = express.Router();
const anunciosController = require('../controllers/anunciosController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, anunciosController.getAnuncios);
router.post('/', isAuthenticated, anunciosController.saveAnuncio);
router.delete('/:id', isAuthenticated, anunciosController.deleteAnuncio);

module.exports = router;
