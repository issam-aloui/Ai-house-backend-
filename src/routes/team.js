const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { teamMemberValidation } = require('../middleware/validation');

// Public routes
router.get('/', teamController.getAllTeamMembers);
router.get('/:id', teamController.getTeamMemberById);

// Protected admin routes
router.post('/', 
  authenticate,
  teamMemberValidation.create,
  handleValidationErrors,
  teamController.createTeamMember
);

router.put('/:id', authenticate, teamController.updateTeamMember);
router.delete('/:id', authenticate, teamController.deleteTeamMember);

module.exports = router;
