import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification } from "../utils/createNotification.js";

export const createPost = asyncHandler(async (req, res) => {
  const { content, imageUrl } = req.body;
  const userId = req.user.id;

  const result = await pool.query(
    `INSERT INTO posts (content, image_url, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [content, imageUrl || null, userId]
  );

  res.status(201).json({ post: result.rows[0] });
});

export const getFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const userId = req.user.id;

  const result = await pool.query(
    `SELECT 
       p.id, p.content, p.image_url, p.created_at,
       u.id AS author_id, u.first_name, u.last_name, u.profile_picture, u.headline,
       COUNT(DISTINCT l.id) AS like_count,
       COUNT(DISTINCT c.id) AS comment_count,
       EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) AS liked_by_me
     FROM posts p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN likes l ON l.post_id = p.id
     LEFT JOIN comments c ON c.post_id = p.id
     GROUP BY p.id, u.id
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  res.json({ posts: result.rows, page, limit });
});

export const getPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT p.*, u.first_name, u.last_name, u.profile_picture
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.json({ post: result.rows[0] });
});
export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, imageUrl } = req.body;
  const userId = req.user.id;

  const result = await pool.query(
    `UPDATE posts 
     SET content = COALESCE($1, content), 
         image_url = COALESCE($2, image_url),
         updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [content, imageUrl, id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Post not found or not authorized" });
  }

  res.json({ post: result.rows[0] });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await pool.query(
    "DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Post not found or not authorized" });
  }

  res.json({ message: "Post deleted" });
});

export const toggleLike = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user.id;

  const existing = await pool.query(
    "SELECT id FROM likes WHERE post_id = $1 AND user_id = $2",
    [postId, userId]
  );

  if (existing.rows.length > 0) {
    await pool.query("DELETE FROM likes WHERE post_id = $1 AND user_id = $2", [
      postId,
      userId,
    ]);
    return res.json({ liked: false });
  }

  await pool.query("INSERT INTO likes (post_id, user_id) VALUES ($1, $2)", [
    postId,
    userId,
  ]);

  const post = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
  if (post.rows.length > 0) {
    await createNotification({
      recipientId: post.rows[0].user_id,
      senderId: userId,
      type: "like",
      postId,
    });
  }

  res.json({ liked: true });
});

export const addComment = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  const result = await pool.query(
    `INSERT INTO comments (content, post_id, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [content, postId, userId]
  );

  const post = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
  if (post.rows.length > 0) {
    await createNotification({
      recipientId: post.rows[0].user_id,
      senderId: userId,
      type: "comment",
      postId,
    });
  }

  // return with author info + like defaults so frontend can render directly
  const full = await pool.query(
    `SELECT c.*, u.first_name, u.last_name, u.profile_picture
     FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = $1`,
    [result.rows[0].id]
  );

  res.status(201).json({ comment: { ...full.rows[0], like_count: 0, liked_by_me: false } });
});

export const getComments = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user.id;

  const result = await pool.query(
    `SELECT c.*, u.first_name, u.last_name, u.profile_picture,
       COUNT(DISTINCT cl.id) AS like_count,
       EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.id AND user_id = $2) AS liked_by_me
     FROM comments c
     JOIN users u ON c.user_id = u.id
     LEFT JOIN comment_likes cl ON cl.comment_id = c.id
     WHERE c.post_id = $1
     GROUP BY c.id, u.id
     ORDER BY c.created_at ASC`,
    [postId, userId]
  );

  res.json({ comments: result.rows });
});

export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  const result = await pool.query(
    `UPDATE comments SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
    [content, commentId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Comment not found or not authorized" });
  }

  res.json({ comment: result.rows[0] });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  const result = await pool.query(
    "DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id",
    [commentId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Comment not found or not authorized" });
  }

  res.json({ message: "Comment deleted" });
});

export const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  const existing = await pool.query(
    "SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
    [commentId, userId]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      "DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
      [commentId, userId]
    );
    return res.json({ liked: false });
  }

  await pool.query(
    "INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)",
    [commentId, userId]
  );

  res.json({ liked: true });
});