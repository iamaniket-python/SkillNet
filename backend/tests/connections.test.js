import "../tests/setup.js";
import request from "supertest";
import app from "../index.js";
import { cleanupTestUser, closePool } from "./helpers/db.js";

const user1Email = `jest_conn1_${Date.now()}@example.com`;
const user2Email = `jest_conn2_${Date.now()}@example.com`;
let token1, token2, user1Id, user2Id, connectionId;

describe("Connections API", () => {
  beforeAll(async () => {
    const res1 = await request(app).post("/api/auth/register").send({
      firstName: "Conn",
      lastName: "One",
      email: user1Email,
      password: "TestPass123",
    });
    token1 = res1.body.token;
    user1Id = res1.body.user.id;

    const res2 = await request(app).post("/api/auth/register").send({
      firstName: "Conn",
      lastName: "Two",
      email: user2Email,
      password: "TestPass123",
    });
    token2 = res2.body.token;
    user2Id = res2.body.user.id;
  });

  afterAll(async () => {
    await cleanupTestUser(user1Email);
    await cleanupTestUser(user2Email);
    await closePool();
  });

  it("should send a connection request", async () => {
    const res = await request(app)
      .post("/api/connections/request")
      .set("Authorization", `Bearer ${token1}`)
      .send({ userId: user2Id });

    expect(res.status).toBe(201);
    expect(res.body.connection.status).toBe("pending");
    connectionId = res.body.connection.id;
  });

  it("should reject duplicate connection request", async () => {
    const res = await request(app)
      .post("/api/connections/request")
      .set("Authorization", `Bearer ${token1}`)
      .send({ userId: user2Id });

    expect(res.status).toBe(400);
  });

  it("should show pending request for receiver", async () => {
    const res = await request(app)
      .get("/api/connections/pending")
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body.requests.length).toBeGreaterThan(0);
  });

  it("should accept the connection request", async () => {
    const res = await request(app)
      .patch(`/api/connections/${connectionId}/respond`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ action: "accept" });

    expect(res.status).toBe(200);
    expect(res.body.connection.status).toBe("accepted");
  });

  it("should show the connection in both users' lists", async () => {
    const res1 = await request(app)
      .get("/api/connections")
      .set("Authorization", `Bearer ${token1}`);

    expect(res1.body.connections.some((c) => c.id === user2Id)).toBe(true);
  });
});