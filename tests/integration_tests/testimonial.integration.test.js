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

describe("Testimonial API Integration", () => {
  let token;
  let testimonials;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "integration-test-secret";
    token = jwt.sign({ id: 1, role: "super_admin" }, process.env.JWT_SECRET);

    testimonials = [
      {
        id: 1,
        author_name: "Alice",
        content: "Great event",
        rating: 5,
        is_approved: false,
        is_featured: false,
      },
      {
        id: 2,
        author_name: "Nora",
        content: "Very useful workshop",
        rating: 4,
        is_approved: true,
        is_featured: true,
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
              full_name: "Admin User",
              role: "super_admin",
              is_active: true,
            },
          ],
          rowCount: 1,
        };
      }

      if (normalized.startsWith("INSERT INTO testimonials")) {
        const next = {
          id: testimonials.length + 1,
          author_name: params[0],
          author_title: params[1],
          author_organization: params[2],
          content: params[3],
          event_id: params[4],
          rating: params[5],
          image_url: params[6],
          is_featured: params[7] || false,
          is_approved: false,
        };
        testimonials.push(next);
        return { rows: [next], rowCount: 1 };
      }

      if (normalized.startsWith("SELECT * FROM testimonials WHERE 1=1")) {
        let results = [...testimonials];
        if (normalized.includes("AND is_approved =") && params.length > 0) {
          results = results.filter((t) => t.is_approved === params[0]);
        }
        return { rows: results, rowCount: results.length };
      }

      if (normalized.startsWith("UPDATE testimonials SET")) {
        const id = Number(params[params.length - 1]);
        const target = testimonials.find((t) => t.id === id);
        if (!target) return { rows: [], rowCount: 0 };
        target.is_approved = true;
        target.is_featured = Boolean(params[1]);
        return { rows: [target], rowCount: 1 };
      }

      if (normalized.startsWith("DELETE FROM testimonials WHERE id = $1")) {
        const id = Number(params[0]);
        const index = testimonials.findIndex((t) => t.id === id);
        if (index === -1) return { rows: [], rowCount: 0 };
        const [deleted] = testimonials.splice(index, 1);
        return { rows: [deleted], rowCount: 1 };
      }

      return { rows: [], rowCount: 0 };
    });
  });

  it("POST /api/v1/testimonials submits pending testimonial", async () => {
    const response = await request(app).post("/api/v1/testimonials").send({
      author_name: "Bob",
      content: "Amazing workshop",
      rating: 5,
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.is_approved).toBe(false);
  });

  it("GET /api/v1/testimonials returns only approved testimonials", async () => {
    const response = await request(app).get("/api/v1/testimonials");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].author_name).toBe("Nora");
  });

  it("PUT /api/v1/testimonials/:id/approve returns 401 without token", async () => {
    const response = await request(app)
      .put("/api/v1/testimonials/1/approve")
      .send({ is_featured: true });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("PUT /api/v1/testimonials/:id/approve approves with token", async () => {
    const response = await request(app)
      .put("/api/v1/testimonials/1/approve")
      .set("Authorization", `Bearer ${token}`)
      .send({ is_featured: true });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.is_approved).toBe(true);
  });

  it("PUT /api/v1/testimonials/:id/approve returns 401 for invalid token", async () => {
    const response = await request(app)
      .put("/api/v1/testimonials/1/approve")
      .set("Authorization", "Bearer invalid-token")
      .send({ is_featured: true });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid token.");
  });

  it("PUT /api/v1/testimonials/:id/approve returns 404 for missing testimonial", async () => {
    const response = await request(app)
      .put("/api/v1/testimonials/999/approve")
      .set("Authorization", `Bearer ${token}`)
      .send({ is_featured: true });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Testimonial not found");
  });

  it("GET /api/v1/testimonials/admin/all returns admin list with token", async () => {
    const response = await request(app)
      .get("/api/v1/testimonials/admin/all")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });

  it("DELETE /api/v1/testimonials/:id deletes existing testimonial", async () => {
    const response = await request(app)
      .delete("/api/v1/testimonials/1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("DELETE /api/v1/testimonials/:id returns 404 for missing testimonial", async () => {
    const response = await request(app)
      .delete("/api/v1/testimonials/999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Testimonial not found");
  });
});
