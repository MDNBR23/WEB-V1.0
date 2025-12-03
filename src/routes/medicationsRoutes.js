const express = require('express');
const router = express.Router();
const medicationsController = require('../controllers/medicationsController');
const { isAdmin } = require('../middleware/auth');

router.get('/', medicationsController.getMedications);
router.post('/', isAdmin, medicationsController.saveMedication);
router.delete('/:id', isAdmin, medicationsController.deleteMedication);

router.get('/infusions/list', medicationsController.getInfusionMedications);
router.post('/infusions/create', isAdmin, medicationsController.createInfusionMedication);
router.put('/infusions/:id', isAdmin, medicationsController.updateInfusionMedication);
router.delete('/infusions/:id', isAdmin, medicationsController.deleteInfusionMedication);

router.get('/presentations/:medicationId', medicationsController.getPresentations);
router.post('/presentations/:medicationId', isAdmin, medicationsController.createPresentation);
router.put('/presentations/:id', isAdmin, medicationsController.updatePresentation);
router.delete('/presentations/:id', isAdmin, medicationsController.deletePresentation);

module.exports = router;
