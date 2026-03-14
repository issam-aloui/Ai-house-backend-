const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { adminValidation } = require('../middleware/validation');

// Public routes
router.post('/login', 
  adminValidation.login,
  handleValidationErrors,
  adminController.login
);

// Protected routes (all authenticated admins)
router.get('/profile', authenticate, adminController.getProfile);
router.put('/change-password', authenticate, adminController.changePassword);

// Super admin only routes
router.get('/', authenticate, authorize('super_admin'), adminController.getAllAdmins);
router.post('/', 
  authenticate, 
  authorize('super_admin'),
  adminValidation.create,
  handleValidationErrors,
  adminController.createAdmin
);
router.put('/:id', authenticate, authorize('super_admin'), adminController.updateAdmin);
router.delete('/:id', authenticate, authorize('super_admin'), adminController.deleteAdmin);

module.exports = router;
