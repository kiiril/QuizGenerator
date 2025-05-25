const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Signup route
router.post('/signup', (req, res, next) => {
  console.log('POST /signup hit');
  authController.signup(req, res, next);
});

// Login route
router.post('/login', (req, res, next) => {
  console.log('POST /login hit');
  authController.login(req, res, next);
});

module.exports = router;
