import "../tests/setup.js";
import request from "supertest";
import app from "../index.js";
import { cleanupTestUser, closePool } from "./helpers/db.js";

const testEmail = `jest_test_${Date.now()}@example.com`;

describe("Auth API", () => {
  afterAll(async () => {
    await cleanupTestUser(testEmail);
    await closePool();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        firstName: "Jest",
        lastName: "Test",
        email: testEmail,
        password: "TestPass123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe(testEmail);
    });

    it("should reject duplicate email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        firstName: "Jest",
        lastName: "Test",
        email: testEmail,
        password: "TestPass123",
      });

      expect(res.status).toBe(400);
    });

    it("should reject invalid email format", async () => {
      const res = await request(app).post("/api/auth/register").send({
        firstName: "Jest",
        lastName: "Test",
        email: "not-an-email",
        password: "TestPass123",
      });

      expect(res.status).toBe(400);
    });

    it("should reject short password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        firstName: "Jest",
        lastName: "Test",
        email: `short_${Date.now()}@example.com`,
        password: "123",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testEmail,
        password: "TestPass123",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should reject wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testEmail,
        password: "WrongPassword",
      });

      expect(res.status).toBe(400);
    });

    it("should reject non-existent email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "doesnotexist@example.com",
        password: "TestPass123",
      });

      expect(res.status).toBe(400);
    });
  });
});