const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { isAdmin } = require('../middleware/auth');

router.get('/export', isAdmin, backupController.exportBackup);
router.post('/import', isAdmin, backupController.importBackup);
router.post('/create', isAdmin, backupController.createBackup);
router.get('/list', isAdmin, backupController.listBackups);
router.get('/download/:filename', isAdmin, backupController.downloadBackup);
router.delete('/:filename', isAdmin, backupController.deleteBackup);

module.exports = router;
