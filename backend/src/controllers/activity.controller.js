import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// user ke apne posts (activity tab ke liye)
export const getUserPosts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT 
       p.id, p.content, p.image_url, p.created_at,
       u.id AS author_id, u.first_name, u.last_name, u.profile_picture, u.headline,
       COUNT(DISTINCT l.id) AS like_count,
       COUNT(DISTINCT c.id) AS comment_count,
       EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $2) AS liked_by_me
     FROM posts p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN likes l ON l.post_id = p.id
     LEFT JOIN comments c ON c.post_id = p.id
     WHERE p.user_id = $1
     GROUP BY p.id, u.id
     ORDER BY p.created_at DESC
     LIMIT $3 OFFSET $4`,
    [id, currentUserId, limit, offset]
  );

  res.json({ posts: result.rows, page, limit });
});

// activity summary (counts) — profile ke Activity header ke liye
export const getActivitySummary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const postsCount = await pool.query("SELECT COUNT(*) FROM posts WHERE user_id = $1", [id]);
  const commentsCount = await pool.query(
    "SELECT COUNT(*) FROM comments WHERE user_id = $1",
    [id]
  );
  const likesGivenCount = await pool.query(
    "SELECT COUNT(*) FROM likes WHERE user_id = $1",
    [id]
  );

  res.json({
    posts: parseInt(postsCount.rows[0].count),
    comments: parseInt(commentsCount.rows[0].count),
    likes: parseInt(likesGivenCount.rows[0].count),
  });
});