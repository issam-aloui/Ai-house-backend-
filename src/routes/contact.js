const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { contactValidation } = require('../middleware/validation');

// Public route
router.post('/', 
  contactValidation.create,
  handleValidationErrors,
  contactController.submitInquiry
);

// Protected admin routes
router.get('/', authenticate, contactController.getAllInquiries);
router.get('/stats', authenticate, contactController.getInquiryStats);
router.get('/:id', authenticate, contactController.getInquiryById);
router.put('/:id/status', authenticate, contactController.updateInquiryStatus);
router.delete('/:id', authenticate, contactController.deleteInquiry);

module.exports = router;
