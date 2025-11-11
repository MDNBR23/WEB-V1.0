const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAdmin } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/session', authController.getSession);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', isAdmin, authController.resendVerification);

module.exports = router;
