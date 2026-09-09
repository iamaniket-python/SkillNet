import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const currentUserId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ message: "Search query is required" });
  }

  await pool.query(
    `INSERT INTO search_history (user_id, query)
     VALUES ($1, $2)
     ON CONFLICT (user_id, query) DO UPDATE SET created_at = NOW()`,
    [currentUserId, q.trim()],
  );

  const searchTerm = `%${q.trim()}%`;

  const result = await pool.query(
    `SELECT 
       u.id, u.first_name, u.last_name, u.headline, u.location, u.profile_picture,
       c.status AS connection_status
     FROM users u
     LEFT JOIN connections c 
       ON (c.requester_id = $1 AND c.receiver_id = u.id) 
       OR (c.receiver_id = $1 AND c.requester_id = u.id)
     WHERE u.id != $1
       AND (
         u.first_name ILIKE $2 OR 
         u.last_name ILIKE $2 OR 
         CONCAT(u.first_name, ' ', u.last_name) ILIKE $2 OR
         u.headline ILIKE $2 OR
         u.location ILIKE $2
       )
     ORDER BY 
       CASE WHEN CONCAT(u.first_name, ' ', u.last_name) ILIKE $2 THEN 0 ELSE 1 END,
       u.first_name ASC
     LIMIT $3 OFFSET $4`,
    [currentUserId, searchTerm, limit, offset],
  );

  // log search appearances (har user jo result mein aaya)
  if (result.rows.length > 0) {
    const values = result.rows
      .map((u) => `(${u.id}, ${currentUserId})`)
      .join(", ");
    await pool.query(
      `INSERT INTO search_appearances (user_id, searched_by_id) VALUES ${values}`,
    );
  }

  res.json({ users: result.rows, page, limit });
});

export const suggestedUsers = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const limit = parseInt(req.query.limit) || 10;

  const result = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.headline, u.location, u.profile_picture
     FROM users u
     WHERE u.id != $1
       AND u.id NOT IN (
         SELECT CASE WHEN requester_id = $1 THEN receiver_id ELSE requester_id END
         FROM connections
         WHERE requester_id = $1 OR receiver_id = $1
       )
     ORDER BY RANDOM()
     LIMIT $2`,
    [currentUserId, limit],
  );

  res.json({ users: result.rows });
});

export const getSearchHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await pool.query(
    `SELECT query FROM search_history 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT 8`,
    [userId],
  );

  res.json({ history: result.rows.map((r) => r.query) });
});

export const deleteSearchHistoryItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { query } = req.params;

  await pool.query(
    "DELETE FROM search_history WHERE user_id = $1 AND query = $2",
    [userId, decodeURIComponent(query)],
  );

  res.json({ message: "Removed" });
});

export const clearSearchHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await pool.query("DELETE FROM search_history WHERE user_id = $1", [userId]);

  res.json({ message: "History cleared" });
});
