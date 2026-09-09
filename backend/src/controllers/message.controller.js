import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get or create conversation between two users
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { userId: otherUserId } = req.body;

  if (parseInt(otherUserId) === userId) {
    return res.status(400).json({ message: "Cannot message yourself" });
  }

  const [user1Id, user2Id] =
    userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];

  let result = await pool.query(
    "SELECT * FROM conversations WHERE user1_id = $1 AND user2_id = $2",
    [user1Id, user2Id]
  );

  if (result.rows.length === 0) {
    result = await pool.query(
      `INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING *`,
      [user1Id, user2Id]
    );
  }

  res.json({ conversation: result.rows[0] });
});

// Get all conversations for current user (inbox list)
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await pool.query(
    `SELECT c.id AS conversation_id,
       u.id AS other_user_id, u.first_name, u.last_name, u.profile_picture, u.last_seen,
       (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
       (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
       (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND is_read = FALSE) AS unread_count
     FROM conversations c
     JOIN users u ON u.id = CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END
     WHERE c.user1_id = $1 OR c.user2_id = $1
     ORDER BY last_message_at DESC NULLS LAST`,
    [userId]
  );

  res.json({ conversations: result.rows });
});
// Get message history for a conversation
export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id: conversationId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const offset = (page - 1) * limit;

  // verify user belongs to this conversation
  const convo = await pool.query(
    "SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)",
    [conversationId, userId]
  );

  if (convo.rows.length === 0) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const result = await pool.query(
    `SELECT * FROM messages WHERE conversation_id = $1
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [conversationId, limit, offset]
  );

  // mark messages as read
  await pool.query(
    "UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_id != $2",
    [conversationId, userId]
  );

  res.json({ messages: result.rows.reverse(), page, limit });
});