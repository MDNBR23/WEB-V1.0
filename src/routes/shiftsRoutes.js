const express = require('express');
const router = express.Router();
const shiftsController = require('../controllers/shiftsController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/summary', isAuthenticated, shiftsController.getSummary);
router.get('/config', isAuthenticated, shiftsController.getConfig);
router.post('/config', isAuthenticated, shiftsController.saveConfig);
router.post('/generate-ops', isAuthenticated, shiftsController.generateOps);
router.post('/delete-bulk', isAuthenticated, shiftsController.deleteBulk);
router.get('/', isAuthenticated, shiftsController.getShifts);
router.post('/', isAuthenticated, shiftsController.createShift);
router.put('/:id', isAuthenticated, shiftsController.updateShift);
router.delete('/:id', isAuthenticated, shiftsController.deleteShift);

module.exports = router;
