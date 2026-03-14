const express = require('express');
const router = express.Router();
const statisticController = require('../controllers/statisticController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { statisticValidation } = require('../middleware/validation');

// Public routes
router.get('/', statisticController.getAllStatistics);
router.get('/:id', statisticController.getStatisticById);

// Protected admin routes
router.post('/', 
  authenticate,
  statisticValidation.create,
  handleValidationErrors,
  statisticController.createStatistic
);

router.put('/:id', 
  authenticate,
  statisticValidation.update,
  handleValidationErrors,
  statisticController.updateStatistic
);

router.patch('/:id/value', 
  authenticate,
  statisticController.updateValue
);

router.delete('/:id', authenticate, statisticController.deleteStatistic);

module.exports = router;
