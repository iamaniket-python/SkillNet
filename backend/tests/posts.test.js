import "../tests/setup.js";
import request from "supertest";
import app from "../index.js";
import { cleanupTestUser, closePool } from "./helpers/db.js";

const testEmail = `jest_posts_${Date.now()}@example.com`;
let token;
let postId;

describe("Posts API", () => {
  beforeAll(async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Post",
      lastName: "Tester",
      email: testEmail,
      password: "TestPass123",
    });
    token = res.body.token;
  });

  afterAll(async () => {
    await cleanupTestUser(testEmail);
    await closePool();
  });

  it("should reject creating post without auth", async () => {
    const res = await request(app).post("/api/posts").send({ content: "No auth post" });
    expect(res.status).toBe(401);
  });

  it("should create a post with valid auth", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Jest test post" });

    expect(res.status).toBe(201);
    expect(res.body.post.content).toBe("Jest test post");
    postId = res.body.post.id;
  });

  it("should reject empty post content", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "" });

    expect(res.status).toBe(400);
  });

  it("should fetch the feed", async () => {
    const res = await request(app)
      .get("/api/posts/feed")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.posts)).toBe(true);
  });

  it("should like a post", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(true);
  });

  it("should unlike on second like call (toggle)", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(false);
  });

  it("should add a comment", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Nice test post" });

    expect(res.status).toBe(201);
    expect(res.body.comment.content).toBe("Nice test post");
  });

  it("should delete own post", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("should return 404 for deleting non-existent post", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});