const express = require('express');
const router = express.Router();
const guiasController = require('../controllers/guiasController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, guiasController.getGuias);
router.post('/', isAuthenticated, guiasController.saveGuia);
router.delete('/:id', isAuthenticated, guiasController.deleteGuia);

module.exports = router;
