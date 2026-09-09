import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT n.*, 
       u.first_name AS sender_first_name, 
       u.last_name AS sender_last_name, 
       u.profile_picture AS sender_profile_picture
     FROM notifications n
     JOIN users u ON u.id = n.sender_id
     WHERE n.recipient_id = $1
     ORDER BY n.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  res.json({ notifications: result.rows, page, limit });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await pool.query(
    "SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND is_read = FALSE",
    [userId]
  );

  res.json({ count: parseInt(result.rows[0].count) });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await pool.query(
    `UPDATE notifications SET is_read = TRUE 
     WHERE id = $1 AND recipient_id = $2 RETURNING *`,
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.json({ notification: result.rows[0] });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await pool.query(
    "UPDATE notifications SET is_read = TRUE WHERE recipient_id = $1 AND is_read = FALSE",
    [userId]
  );

  res.json({ message: "All notifications marked as read" });
});