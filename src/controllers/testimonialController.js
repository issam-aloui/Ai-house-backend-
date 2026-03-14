const Testimonial = require('../models/Testimonial');

// Get all approved testimonials (public)
exports.getAllTestimonials = async (req, res) => {
  try {
    const { featured, limit = 10 } = req.query;
    
    const testimonials = await Testimonial.findAll({
      is_approved: true,
      is_featured: featured === 'true' ? true : undefined,
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonials',
      error: error.message
    });
  }
};

// Submit testimonial (public)
exports.createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create({
      ...req.body,
      is_approved: false // Requires admin approval
    });

    res.status(201).json({
      success: true,
      message: 'Testimonial submitted successfully. Pending admin approval.',
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting testimonial',
      error: error.message
    });
  }
};

// Get all testimonials for admin (including unapproved)
exports.getAllTestimonialsAdmin = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    const testimonials = await Testimonial.findAll({
      is_approved: status === 'pending' ? false : undefined,
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonials',
      error: error.message
    });
  }
};

// Approve testimonial (admin)
exports.approveTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.update(id, {
      is_approved: true,
      is_featured: req.body.is_featured || false
    });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial approved successfully',
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving testimonial',
      error: error.message
    });
  }
};

// Update testimonial (admin)
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.update(id, req.body);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating testimonial',
      error: error.message
    });
  }
};

// Delete testimonial (admin)
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.delete(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting testimonial',
      error: error.message
    });
  }
};
