const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { eventValidation } = require('../middleware/validation');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/:id', eventController.getEventById);

// Protected admin routes
router.post('/', 
  authenticate, 
  eventValidation.create, 
  handleValidationErrors,
  eventController.createEvent
);

router.put('/:id', 
  authenticate, 
  eventValidation.update,
  handleValidationErrors,
  eventController.updateEvent
);

router.delete('/:id', 
  authenticate,
  eventController.deleteEvent
);

module.exports = router;
