const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { isAdmin } = require('../middleware/auth');

router.get('/', isAdmin, usersController.getUsers);
router.put('/:username', isAdmin, usersController.updateUser);
router.delete('/:username', isAdmin, usersController.deleteUser);

module.exports = router;
