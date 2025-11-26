const express = require('express');
const router = express.Router();
const featureUpdatesController = require('../controllers/featureUpdatesController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, featureUpdatesController.getFeatureUpdates);
router.post('/', isAuthenticated, featureUpdatesController.createFeatureUpdate);
router.delete('/:id', isAuthenticated, featureUpdatesController.deleteFeatureUpdate);

module.exports = router;
