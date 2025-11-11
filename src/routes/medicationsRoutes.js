const express = require('express');
const router = express.Router();
const medicationsController = require('../controllers/medicationsController');
const { isAdmin } = require('../middleware/auth');

router.get('/', medicationsController.getMedications);
router.post('/', isAdmin, medicationsController.saveMedication);
router.delete('/:id', isAdmin, medicationsController.deleteMedication);

module.exports = router;
