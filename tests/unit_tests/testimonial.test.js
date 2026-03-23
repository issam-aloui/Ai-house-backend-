const request = require('supertest');
const app = require('../src/app');
const Testimonial = require('../src/models/Testimonial');

jest.mock('../src/models/Testimonial');
jest.mock('../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.admin = { id: 1, role: 'super_admin' };
    next();
  },
  authorize: () => (req, res, next) => next(),
  optionalAuth: (req, res, next) => next()
}));

describe('TestimonialController API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/testimonials', () => {
    it('should submit a testimonial pending approval', async () => {
      const validTestimonial = {
        author_name: 'Alice',
        content: 'Great event!',
        rating: 5
      };

      const createdTestimonial = { id: 1, ...validTestimonial, is_approved: false };
      Testimonial.create.mockResolvedValue(createdTestimonial);

      const response = await request(app)
        .post('/api/v1/testimonials')
        .send(validTestimonial);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Testimonial submitted successfully. Pending admin approval.');
      expect(response.body.data).toEqual(createdTestimonial);
      expect(Testimonial.create).toHaveBeenCalledWith(expect.objectContaining({
        ...validTestimonial,
        is_approved: false
      }));
    });

    it('should fail validation for missing fields', async () => {
      const response = await request(app)
        .post('/api/v1/testimonials')
        .send({ author_name: 'Alice' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/v1/testimonials/:id/approve', () => {
    it('should approve a testimonial successfully', async () => {
      const approvedTestimonial = { id: 1, author_name: 'Alice', is_approved: true, is_featured: false };
      Testimonial.update.mockResolvedValue(approvedTestimonial);

      const response = await request(app)
        .put('/api/v1/testimonials/1/approve')
        .send({ is_featured: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Testimonial approved successfully');
      expect(response.body.data).toEqual(approvedTestimonial);
      expect(Testimonial.update).toHaveBeenCalledWith('1', { is_approved: true, is_featured: false });
    });

    it('should return 404 if approving a non-existent testimonial', async () => {
      Testimonial.update.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/v1/testimonials/999/approve')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Testimonial not found');
    });
  });

  describe('GET /api/v1/testimonials', () => {
    it('should get approved testimonials for public route', async () => {
      const mockTestimonials = [{ id: 1, is_approved: true }];
      Testimonial.findAll.mockResolvedValue(mockTestimonials);

      const response = await request(app).get('/api/v1/testimonials');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTestimonials);
      expect(Testimonial.findAll).toHaveBeenCalledWith({ is_approved: true, is_featured: undefined, limit: 10 });
    });
  });

  describe('GET /api/v1/testimonials/admin/all', () => {
    it('should get all testimonials including pending for admin', async () => {
      const mockTestimonials = [{ id: 1, is_approved: true }, { id: 2, is_approved: false }];
      Testimonial.findAll.mockResolvedValue(mockTestimonials);

      const response = await request(app).get('/api/v1/testimonials/admin/all');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTestimonials);
      expect(Testimonial.findAll).toHaveBeenCalledWith({ is_approved: undefined, limit: 50 });
    });
  });

  describe('DELETE /api/v1/testimonials/:id', () => {
    it('should delete a testimonial', async () => {
      Testimonial.delete.mockResolvedValue({ id: 1 });

      const response = await request(app).delete('/api/v1/testimonials/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Testimonial.delete).toHaveBeenCalledWith('1');
    });
  });
});
