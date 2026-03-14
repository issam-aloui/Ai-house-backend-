const { body, param, query } = require('express-validator');

// Event validations
const eventValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('event_type')
      .notEmpty().withMessage('Event type is required')
      .isIn(['workshop', 'seminar', 'datathon', 'training', 'conference', 'other'])
      .withMessage('Invalid event type'),
    body('start_date')
      .notEmpty().withMessage('Start date is required')
      .isISO8601().withMessage('Invalid date format'),
    body('description').optional().trim(),
    body('end_date').optional().isISO8601().withMessage('Invalid end date format'),
    body('location').optional().trim().isLength({ max: 200 }),
    body('max_participants').optional().isInt({ min: 1 }),
    body('status')
      .optional()
      .isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
  ],
  update: [
    param('id').isInt().withMessage('Invalid event ID'),
    body('title').optional().trim().isLength({ max: 200 }),
    body('event_type')
      .optional()
      .isIn(['workshop', 'seminar', 'datathon', 'training', 'conference', 'other']),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('max_participants').optional().isInt({ min: 1 }),
    body('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
  ]
};

// Testimonial validations
const testimonialValidation = {
  create: [
    body('author_name')
      .trim()
      .notEmpty().withMessage('Author name is required')
      .isLength({ max: 100 }),
    body('content')
      .trim()
      .notEmpty().withMessage('Content is required'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('event_id').optional().isInt()
  ],
  update: [
    param('id').isInt().withMessage('Invalid testimonial ID'),
    body('is_approved').optional().isBoolean()
  ]
};

// Contact validations
const contactValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 100 }),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    body('subject')
      .trim()
      .notEmpty().withMessage('Subject is required')
      .isLength({ max: 200 }),
    body('message')
      .trim()
      .notEmpty().withMessage('Message is required'),
    body('inquiry_type')
      .optional()
      .isIn(['general', 'partnership', 'event', 'research', 'other'])
  ]
};

// Admin validations
const adminValidation = {
  create: [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name')
      .trim()
      .notEmpty().withMessage('Full name is required')
      .isLength({ max: 100 }),
    body('role')
      .optional()
      .isIn(['admin', 'super_admin'])
  ],
  login: [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ]
};

// Statistics validations
const statisticValidation = {
  create: [
    body('label')
      .trim()
      .notEmpty().withMessage('Label is required')
      .isLength({ max: 100 }),
    body('current_value')
      .notEmpty().withMessage('Current value is required')
      .isInt(),
    body('target_value').optional().isInt()
  ],
  update: [
    param('id').isInt().withMessage('Invalid statistic ID'),
    body('current_value').optional().isInt()
  ]
};

// Team member validations
const teamMemberValidation = {
  create: [
    body('full_name')
      .trim()
      .notEmpty().withMessage('Full name is required')
      .isLength({ max: 100 }),
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ max: 100 })
  ]
};

// Pagination validation
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

module.exports = {
  eventValidation,
  testimonialValidation,
  contactValidation,
  adminValidation,
  statisticValidation,
  teamMemberValidation,
  paginationValidation
};
