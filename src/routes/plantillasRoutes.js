const express = require('express');
const router = express.Router();
const plantillasController = require('../controllers/plantillasController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, plantillasController.getPlantillas);
router.post('/', isAuthenticated, plantillasController.createPlantilla);
router.put('/:id', isAuthenticated, plantillasController.updatePlantilla);
router.delete('/:id', isAuthenticated, plantillasController.deletePlantilla);

module.exports = router;
