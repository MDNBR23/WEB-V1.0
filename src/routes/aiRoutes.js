const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.post('/stream', isAuthenticated, aiController.streamAI);
router.get('/logs', isAuthenticated, isAdmin, aiController.getAILogs);
router.get('/stats', isAuthenticated, isAdmin, aiController.getAIStats);
router.post('/rate', isAuthenticated, aiController.rateAIResponse);

module.exports = router;
