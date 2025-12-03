const express = require('express');
const router = express.Router();
const resetPasswordController = require('../controllers/resetPasswordController');

router.post('/reset-password-request', resetPasswordController.resetPasswordRequest);
router.post('/reset-password', resetPasswordController.resetPassword);

module.exports = router;
