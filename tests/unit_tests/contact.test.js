const request = require("supertest");
const app = require("../../src/app");
const ContactInquiry = require("../../src/models/ContactInquiry");
const nodemailer = require("nodemailer");

jest.mock("../../src/models/ContactInquiry");
jest.mock("nodemailer");
jest.mock("../../src/middleware/auth", () => ({
  authenticate: (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
    const token = req.token || req.headers.token || bearerToken;
    if (token === "token") {
      req.admin = { id: 1, role: "super_admin" };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  },
  authorize: () => (req, res, next) => next(),
  optionalAuth: (req, res, next) => next(),
}));

const mockSendMail = jest.fn();
nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

describe("ContactController API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SMTP_HOST = "smtp.test.local";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "test-password";
    process.env.ADMIN_EMAIL = "admin@example.com";
  });

  describe("POST /api/v1/contact", () => {
    it("should submit a contact inquiry successfully", async () => {
      const validInquiry = {
        name: "John Doe",
        email: "john@example.com",
        subject: "General Question",
        message: "Hello, how can I join?",
        inquiry_type: "general",
      };

      const createdInquiry = { id: 1, ...validInquiry };
      ContactInquiry.create.mockResolvedValue(createdInquiry);

      const response = await request(app)
        .post("/api/v1/contact")
        .send(validInquiry);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Inquiry submitted successfully. We will contact you soon.",
      );
      expect(response.body.data).toEqual(createdInquiry);
      expect(ContactInquiry.create).toHaveBeenCalledWith(
        expect.objectContaining(validInquiry),
      );
      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalled();
    });

    it("should skip email when SMTP host is not configured", async () => {
      delete process.env.SMTP_HOST;

      ContactInquiry.create.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        subject: "General Question",
        message: "Hello, how can I join?",
      });

      const response = await request(app).post("/api/v1/contact").send({
        name: "John Doe",
        email: "john@example.com",
        subject: "General Question",
        message: "Hello, how can I join?",
      });

      expect(response.status).toBe(201);
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("should fail with validation errors for missing required fields", async () => {
      const response = await request(app).post("/api/v1/contact").send({
        name: "John Doe",
        // Missing email, subject, message
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("should handle errors when creating an inquiry fails", async () => {
      ContactInquiry.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/api/v1/contact").send({
        name: "John Doe",
        email: "john@example.com",
        subject: "General Question",
        message: "Hello, how can I join?",
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error submitting inquiry");
    });
  });

  describe("PUT /api/v1/contact/:id/status", () => {
    it("should update inquiry status and send email if resolved", async () => {
      const updatedInquiry = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        status: "resolved",
      };

      ContactInquiry.updateStatus.mockResolvedValue(updatedInquiry);

      const response = await request(app)
        .put("/api/v1/contact/1/status")
        .set("Authorization", "Bearer token")
        .send({ status: "resolved", admin_notes: "Done", assigned_to: 2 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedInquiry);
      expect(ContactInquiry.updateStatus).toHaveBeenCalledWith(
        "1",
        "resolved",
        "Done",
        2,
      );
      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalled();
    });

    it("should return 404 if inquiry not found for status update", async () => {
      ContactInquiry.updateStatus.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/v1/contact/999/status")
        .set("Authorization", "Bearer token")
        .send({ status: "resolved" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Inquiry not found");
    });

    it("should return unauthorized when token is missing", async () => {
      const response = await request(app)
        .put("/api/v1/contact/1/status")
        .send({ status: "resolved" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });
  });

  describe("GET /api/v1/contact", () => {
    it("should get all inquiries", async () => {
      const mockInquiries = [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
      ];
      ContactInquiry.findAll.mockResolvedValue(mockInquiries);

      const response = await request(app)
        .get("/api/v1/contact")
        .set("Authorization", "Bearer token")
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockInquiries);
      expect(ContactInquiry.findAll).toHaveBeenCalled();
    });

    it("should return unauthorized when token is missing", async () => {
      const response = await request(app).get("/api/v1/contact");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });
  });

  describe("GET /api/v1/contact/stats", () => {
    it("should get inquiry statistics", async () => {
      const mockStats = {
        total: "10",
        new_count: "4",
        in_progress_count: "3",
        resolved_count: "3",
      };
      ContactInquiry.getStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get("/api/v1/contact/stats")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStats);
      expect(ContactInquiry.getStats).toHaveBeenCalled();
    });

    it("should return unauthorized when token is missing", async () => {
      const response = await request(app).get("/api/v1/contact/stats");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });
  });

  describe("GET /api/v1/contact/:id", () => {
    it("should get a single inquiry by id", async () => {
      const mockInquiry = { id: 1, name: "John Doe" };
      ContactInquiry.findById.mockResolvedValue(mockInquiry);

      const response = await request(app)
        .get("/api/v1/contact/1")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockInquiry);
      expect(ContactInquiry.findById).toHaveBeenCalledWith("1");
    });

    it("should return unauthorized when token is missing", async () => {
      const response = await request(app).get("/api/v1/contact/1");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });
  });

  describe("DELETE /api/v1/contact/:id", () => {
    it("should delete an inquiry", async () => {
      ContactInquiry.delete.mockResolvedValue({ id: 1 });

      const response = await request(app)
        .delete("/api/v1/contact/1")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(ContactInquiry.delete).toHaveBeenCalledWith("1");
    });

    it("should return unauthorized when token is missing", async () => {
      const response = await request(app).delete("/api/v1/contact/1");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });
  });
});
