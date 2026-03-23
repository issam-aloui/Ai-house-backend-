const request = require("supertest");
const app = require("../../src/app");
const TeamMember = require("../../src/models/TeamMember");

// Mock the TeamMember model
jest.mock("../../src/models/TeamMember");

// Mock the authentication middleware
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

describe("TeamController API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/team", () => {
    it("should return all active team members", async () => {
      const mockMembers = [
        { id: 1, name: "John Doe", role: "Developer", is_active: true },
        { id: 2, name: "Jane Smith", role: "Designer", is_active: true },
      ];

      TeamMember.findAll.mockResolvedValue(mockMembers);

      const response = await request(app).get("/api/v1/team");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMembers);
      expect(TeamMember.findAll).toHaveBeenCalledWith({ is_active: true });
    });

    it("should handle errors when fetching team members", async () => {
      TeamMember.findAll.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/v1/team");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error fetching team members");
    });
  });

  describe("GET /api/v1/team/:id", () => {
    it("should return a single team member by id", async () => {
      const mockMember = { id: 1, name: "John Doe", role: "Developer" };
      TeamMember.findById.mockResolvedValue(mockMember);

      const response = await request(app).get("/api/v1/team/1");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMember);
      expect(TeamMember.findById).toHaveBeenCalledWith("1");
    });

    it("should return 404 if team member not found", async () => {
      TeamMember.findById.mockResolvedValue(null);

      const response = await request(app).get("/api/v1/team/999");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Team member not found");
    });

    it("should handle errors when fetching a single team member", async () => {
      TeamMember.findById.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/v1/team/1");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error fetching team member");
    });
  });

  describe("POST /api/v1/team", () => {
    it("should create a new team member", async () => {
      const newMemberData = { full_name: "New Member", title: "Tester" };
      const createdMember = { id: 90, ...newMemberData };

      TeamMember.create.mockResolvedValue(createdMember);

      const response = await request(app)
        .post("/api/v1/team")
        .set("Authorization", "Bearer token")
        .send(newMemberData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Team member created successfully");
      expect(response.body.data).toEqual(createdMember);
      expect(TeamMember.create).toHaveBeenCalled();
    });

    it("should handle errors when creating a team member", async () => {
      TeamMember.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/v1/team")
        .set("Authorization", "Bearer token")
        .send({ full_name: "Error Member", title: "Error Title" });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error creating team member");
    });

    it("should return unauthorized when token is missing", async () => {
      const response = await request(app)
        .post("/api/v1/team")
        .send({ full_name: "New Member", title: "Tester" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });
  });

  describe("PUT /api/v1/team/:id", () => {
    it("should update an existing team member", async () => {
      const updateData = { role: "Lead Developer" };
      const updatedMember = { id: 1, name: "John Doe", role: "Lead Developer" };

      TeamMember.update.mockResolvedValue(updatedMember);

      const response = await request(app)
        .put("/api/v1/team/1")
        .set("Authorization", "Bearer token")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Team member updated successfully");
      expect(response.body.data).toEqual(updatedMember);
      expect(TeamMember.update).toHaveBeenCalledWith("1", updateData);
    });

    it("should return 404 if team member to update is not found", async () => {
      TeamMember.update.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/v1/team/999")
        .set("Authorization", "Bearer token")
        .send({ role: "Lead" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Team member not found");
    });

    it("should handle errors when updating a team member", async () => {
      TeamMember.update.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put("/api/v1/team/1")
        .set("Authorization", "Bearer token")
        .send({ role: "Lead" });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error updating team member");
    });

    it("should return unauthorized when token is missing", async () => {
      const response = await request(app)
        .put("/api/v1/team/1")
        .send({ role: "Lead" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });
  });

  describe("DELETE /api/v1/team/:id", () => {
    it("should delete a team member", async () => {
      const deletedMember = { id: 1, name: "John Doe" };
      TeamMember.delete.mockResolvedValue(deletedMember);

      const response = await request(app)
        .delete("/api/v1/team/1")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Team member deleted successfully");
      expect(TeamMember.delete).toHaveBeenCalledWith("1");
    });

    it("should return 404 if team member to delete is not found", async () => {
      TeamMember.delete.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/v1/team/999")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Team member not found");
    });

    it("should handle errors when deleting a team member", async () => {
      TeamMember.delete.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .delete("/api/v1/team/1")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error deleting team member");
    });

    it("should return unauthorized when token is missing", async () => {
      const response = await request(app).delete("/api/v1/team/1");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });
  });
});
