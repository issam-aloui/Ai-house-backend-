const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { testimonialValidation } = require('../middleware/validation');

// Public routes
router.get('/', testimonialController.getAllTestimonials);
router.post('/', 
  testimonialValidation.create,
  handleValidationErrors,
  testimonialController.createTestimonial
);

// Protected admin routes
router.get('/admin/all', authenticate, testimonialController.getAllTestimonialsAdmin);
router.put('/:id/approve', authenticate, testimonialController.approveTestimonial);
router.put('/:id', authenticate, testimonialController.updateTestimonial);
router.delete('/:id', authenticate, testimonialController.deleteTestimonial);

module.exports = router;
