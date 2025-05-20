const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/login', authController.login); // POST /api/auth/login
router.post('/register', authController.register);

module.exports = router;
