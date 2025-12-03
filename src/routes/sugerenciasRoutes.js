const express = require('express');
const router = express.Router();
const sugerenciasController = require('../controllers/sugerenciasController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/count', isAdmin, sugerenciasController.getCount);
router.patch('/mark-seen', isAuthenticated, sugerenciasController.markAsSeen);
router.get('/', isAuthenticated, sugerenciasController.getSugerencias);
router.post('/', isAuthenticated, sugerenciasController.createSugerencia);
router.put('/:id', isAdmin, sugerenciasController.updateSugerencia);
router.delete('/:id', isAdmin, sugerenciasController.deleteSugerencia);

module.exports = router;
