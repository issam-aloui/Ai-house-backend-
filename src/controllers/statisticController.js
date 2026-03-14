const Statistic = require('../models/Statistic');

// Get all active statistics (public)
exports.getAllStatistics = async (req, res) => {
  try {
    const statistics = await Statistic.findAll({ is_active: true });

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// Get single statistic
exports.getStatisticById = async (req, res) => {
  try {
    const { id } = req.params;
    const statistic = await Statistic.findById(id);

    if (!statistic) {
      return res.status(404).json({
        success: false,
        message: 'Statistic not found'
      });
    }

    res.status(200).json({
      success: true,
      data: statistic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistic',
      error: error.message
    });
  }
};

// Create statistic (admin)
exports.createStatistic = async (req, res) => {
  try {
    const statisticData = {
      ...req.body,
      updated_by: req.admin.id
    };

    const statistic = await Statistic.create(statisticData);

    res.status(201).json({
      success: true,
      message: 'Statistic created successfully',
      data: statistic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating statistic',
      error: error.message
    });
  }
};

// Update statistic value (admin)
exports.updateStatistic = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.admin.id
    };

    const statistic = await Statistic.update(id, updateData);

    if (!statistic) {
      return res.status(404).json({
        success: false,
        message: 'Statistic not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Statistic updated successfully',
      data: statistic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating statistic',
      error: error.message
    });
  }
};

// Quick update current value only
exports.updateValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_value } = req.body;

    const statistic = await Statistic.updateValue(id, current_value, req.admin.id);

    if (!statistic) {
      return res.status(404).json({
        success: false,
        message: 'Statistic not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Value updated successfully',
      data: statistic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating value',
      error: error.message
    });
  }
};

// Delete statistic (admin)
exports.deleteStatistic = async (req, res) => {
  try {
    const { id } = req.params;
    const statistic = await Statistic.delete(id);

    if (!statistic) {
      return res.status(404).json({
        success: false,
        message: 'Statistic not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Statistic deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting statistic',
      error: error.message
    });
  }
};
