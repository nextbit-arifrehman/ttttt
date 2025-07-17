// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyJWT = require('../middlewares/verifyJWT');
const verifyRole = require('../middlewares/verifyRole');

// All routes here are protected; user must be logged in
router.use(verifyJWT);

// User profile
router.get('/profile', userController.getProfile);

// Admin only routes
router.get('/all', verifyRole('admin'), userController.getAllUsers);
router.patch('/make-admin/:id', verifyRole('admin'), userController.makeAdmin);
router.patch('/make-agent/:id', verifyRole('admin'), userController.makeAgent);
router.patch('/mark-fraud/:id', verifyRole('admin'), userController.markFraudAgent);
router.delete('/:id', verifyRole('admin'), userController.deleteUser);

module.exports = router;
