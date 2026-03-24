const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../../src/config/database", () => ({
  query: jest.fn(),
  transaction: jest.fn(),
  pool: { end: jest.fn() },
}));

const { query } = require("../../src/config/database");
const app = require("../../src/app");

const normalizeSql = (sql) => sql.replace(/\s+/g, " ").trim();

describe("Team API Integration", () => {
  let token;
  let teamMembers;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "integration-test-secret";
    token = jwt.sign({ id: 1, role: "super_admin" }, process.env.JWT_SECRET);

    teamMembers = [
      {
        id: 1,
        full_name: "Alice",
        title: "Lead",
        role: "Researcher",
        is_active: true,
      },
    ];

    query.mockImplementation(async (sql, params = []) => {
      const normalized = normalizeSql(sql);

      if (normalized.includes("FROM admins WHERE id = $1")) {
        return {
          rows: [
            {
              id: 1,
              username: "admin",
              email: "admin@example.com",
              full_name: "Admin User",
              role: "super_admin",
              is_active: true,
            },
          ],
          rowCount: 1,
        };
      }

      if (
        normalized.startsWith("SELECT * FROM team_members WHERE is_active = $1")
      ) {
        return {
          rows: teamMembers.filter((m) => m.is_active === params[0]),
          rowCount: 1,
        };
      }

      if (normalized.startsWith("SELECT * FROM team_members WHERE id = $1")) {
        const member = teamMembers.find((m) => m.id === Number(params[0]));
        return { rows: member ? [member] : [], rowCount: member ? 1 : 0 };
      }

      if (normalized.startsWith("INSERT INTO team_members")) {
        const next = {
          id: teamMembers.length + 1,
          full_name: params[0],
          title: params[1],
          role: params[2] || null,
          bio: params[3] || null,
          email: params[4] || null,
          image_url: params[5] || null,
          linkedin_url: params[6] || null,
          research_interests: params[7] || null,
          display_order: params[8] || 0,
          is_active: true,
        };
        teamMembers.push(next);
        return { rows: [next], rowCount: 1 };
      }

      if (normalized.startsWith("UPDATE team_members SET")) {
        const id = Number(params[params.length - 1]);
        const member = teamMembers.find((m) => m.id === id);
        if (member && params.length > 0) {
          member.role = params[0];
        }
        return { rows: member ? [member] : [], rowCount: member ? 1 : 0 };
      }

      if (normalized.startsWith("DELETE FROM team_members WHERE id = $1")) {
        const id = Number(params[0]);
        const index = teamMembers.findIndex((m) => m.id === id);
        if (index === -1) return { rows: [], rowCount: 0 };
        const [deleted] = teamMembers.splice(index, 1);
        return { rows: [deleted], rowCount: 1 };
      }

      return { rows: [], rowCount: 0 };
    });
  });

  it("GET /api/v1/team returns active members", async () => {
    const response = await request(app).get("/api/v1/team");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].full_name).toBe("Alice");
  });

  it("POST /api/v1/team returns 401 without token", async () => {
    const response = await request(app).post("/api/v1/team").send({
      full_name: "New Member",
      title: "Engineer",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("POST /api/v1/team creates a member with valid token", async () => {
    const response = await request(app)
      .post("/api/v1/team")
      .set("Authorization", `Bearer ${token}`)
      .send({
        full_name: "New Member",
        title: "Engineer",
        role: "Developer",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.full_name).toBe("New Member");
  });

  it("POST /api/v1/team returns 401 for invalid token", async () => {
    const response = await request(app)
      .post("/api/v1/team")
      .set("Authorization", "Bearer invalid-token")
      .send({
        full_name: "New Member",
        title: "Engineer",
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid token.");
  });

  it("PUT /api/v1/team/:id updates existing member", async () => {
    const response = await request(app)
      .put("/api/v1/team/1")
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "Lead Engineer" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.role).toBe("Lead Engineer");
  });

  it("PUT /api/v1/team/:id returns 404 for missing member", async () => {
    const response = await request(app)
      .put("/api/v1/team/999")
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "Lead Engineer" });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Team member not found");
  });

  it("DELETE /api/v1/team/:id deletes existing member", async () => {
    const response = await request(app)
      .delete("/api/v1/team/1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("DELETE /api/v1/team/:id returns 404 for missing member", async () => {
    const response = await request(app)
      .delete("/api/v1/team/999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Team member not found");
  });
});
