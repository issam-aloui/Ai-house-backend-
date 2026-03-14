const Event = require('../models/Event');

// Get all events (public)
exports.getAllEvents = async (req, res) => {
  try {
    const { status, event_type, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const events = await Event.findAll({
      status,
      event_type,
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

// Get featured events
exports.getFeaturedEvents = async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const events = await Event.findFeatured(parseInt(limit));

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured events',
      error: error.message
    });
  }
};

// Get upcoming events
exports.getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const events = await Event.findUpcoming(parseInt(limit));

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming events',
      error: error.message
    });
  }
};

// Create new event (admin only)
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      created_by: req.admin.id
    };

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

// Update event (admin only)
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.update(id, req.body);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// Delete event (admin only)
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.delete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};
