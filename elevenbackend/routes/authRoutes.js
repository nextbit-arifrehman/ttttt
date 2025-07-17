// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyJWT = require('../middlewares/verifyJWT');

// Public routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Protected route to get user info (for client session validation)
router.get('/me', verifyJWT, authController.getMe);

// Logout route (optional if you handle logout on client side by removing tokens)
router.post('/logout', verifyJWT, authController.logout);

module.exports = router;
