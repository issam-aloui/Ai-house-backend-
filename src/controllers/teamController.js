const TeamMember = require('../models/TeamMember');

// Get all team members (public)
exports.getAllTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.findAll({ is_active: true });

    res.status(200).json({
      success: true,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team members',
      error: error.message
    });
  }
};

// Get single team member
exports.getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await TeamMember.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team member',
      error: error.message
    });
  }
};

// Create team member (admin)
exports.createTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating team member',
      error: error.message
    });
  }
};

// Update team member (admin)
exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await TeamMember.update(id, req.body);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating team member',
      error: error.message
    });
  }
};

// Delete team member (admin)
exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await TeamMember.delete(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting team member',
      error: error.message
    });
  }
};
