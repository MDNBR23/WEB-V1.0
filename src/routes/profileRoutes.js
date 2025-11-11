const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, profileController.getProfile);
router.put('/', isAuthenticated, profileController.updateProfile);
router.post('/change-password', isAuthenticated, profileController.changePassword);
router.post('/delete-account', isAuthenticated, profileController.deleteAccount);

module.exports = router;
