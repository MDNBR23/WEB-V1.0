const express = require('express');
const router = express.Router();
const toolsController = require('../controllers/toolsController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.post('/heartbeat', isAuthenticated, toolsController.heartbeat);
router.get('/tools/status', toolsController.getToolsStatus);
router.put('/tools/status', isAdmin, toolsController.updateToolsStatus);
router.get('/maintenance', toolsController.getMaintenance);
router.put('/maintenance', isAdmin, toolsController.updateMaintenance);

module.exports = router;
