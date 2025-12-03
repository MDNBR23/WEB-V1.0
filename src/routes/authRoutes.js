const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const biometricController = require('../controllers/biometricController');
const { isAdmin } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/session', authController.getSession);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', isAdmin, authController.resendVerification);

// Biometric Authentication Routes
router.post('/biometric/register-options', biometricController.registerOptions);
router.post('/biometric/register-verify', biometricController.registerVerify);
router.post('/biometric/login-options', biometricController.loginOptions);
router.post('/biometric/login-verify', biometricController.loginVerify);
router.get('/biometric/credentials', biometricController.getCredentials);
router.delete('/biometric/credentials/:credentialId', biometricController.deleteCredential);

module.exports = router;
