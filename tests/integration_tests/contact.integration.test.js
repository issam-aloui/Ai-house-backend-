const request = require("supertest");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

jest.mock("nodemailer");
jest.mock("../../src/config/database", () => ({
  query: jest.fn(),
  transaction: jest.fn(),
  pool: { end: jest.fn() },
}));

const { query } = require("../../src/config/database");
const app = require("../../src/app");

const normalizeSql = (sql) => sql.replace(/\s+/g, " ").trim();

describe("Contact API Integration", () => {
  let token;
  let inquiries;
  const mockSendMail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.JWT_SECRET = "integration-test-secret";
    process.env.SMTP_HOST = "smtp.test.local";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "password";

    token = jwt.sign({ id: 1, role: "super_admin" }, process.env.JWT_SECRET);
    nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

    inquiries = [
      {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        subject: "Partnership",
        message: "Lets collaborate",
        inquiry_type: "partnership",
        status: "new",
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

      if (normalized.startsWith("INSERT INTO contact_inquiries")) {
        const next = {
          id: inquiries.length + 1,
          name: params[0],
          email: params[1],
          phone: params[2],
          subject: params[3],
          message: params[4],
          inquiry_type: params[5] || "general",
          status: "new",
        };
        inquiries.push(next);
        return { rows: [next], rowCount: 1 };
      }

      if (normalized.startsWith("SELECT * FROM contact_inquiries WHERE 1=1")) {
        return { rows: [...inquiries], rowCount: inquiries.length };
      }

      if (
        normalized.startsWith("SELECT * FROM contact_inquiries WHERE id = $1")
      ) {
        const found = inquiries.find((i) => i.id === Number(params[0]));
        return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
      }

      if (normalized.startsWith("UPDATE contact_inquiries SET")) {
        const id = Number(params[params.length - 1]);
        const found = inquiries.find((i) => i.id === id);
        if (!found) return { rows: [], rowCount: 0 };
        found.status = params[0];
        return { rows: [found], rowCount: 1 };
      }

      if (
        normalized.startsWith("DELETE FROM contact_inquiries WHERE id = $1")
      ) {
        const id = Number(params[0]);
        const index = inquiries.findIndex((i) => i.id === id);
        if (index === -1) return { rows: [], rowCount: 0 };
        const [deleted] = inquiries.splice(index, 1);
        return { rows: [deleted], rowCount: 1 };
      }

      if (normalized.includes("COUNT(*) as total")) {
        return {
          rows: [
            {
              total: String(inquiries.length),
              new_count: String(
                inquiries.filter((i) => i.status === "new").length,
              ),
              in_progress_count: "0",
              resolved_count: String(
                inquiries.filter((i) => i.status === "resolved").length,
              ),
            },
          ],
          rowCount: 1,
        };
      }

      return { rows: [], rowCount: 0 };
    });
  });

  it("POST /api/v1/contact submits inquiry and triggers notification", async () => {
    const response = await request(app).post("/api/v1/contact").send({
      name: "Bob",
      email: "bob@example.com",
      subject: "General",
      message: "Hello",
      inquiry_type: "general",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
  });

  it("GET /api/v1/contact returns 401 without token", async () => {
    const response = await request(app).get("/api/v1/contact");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("GET /api/v1/contact returns inquiries with valid token", async () => {
    const response = await request(app)
      .get("/api/v1/contact")
      .set("Authorization", `Bearer ${token}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("PUT /api/v1/contact/:id/status resolves inquiry and sends response email", async () => {
    const response = await request(app)
      .put("/api/v1/contact/1/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "resolved" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("resolved");
    expect(mockSendMail).toHaveBeenCalled();
  });
});
