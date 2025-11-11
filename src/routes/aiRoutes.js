const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/stream', isAuthenticated, aiController.streamAI);

module.exports = router;
