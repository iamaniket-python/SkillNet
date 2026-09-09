import pool from "../config/db.js";

export const createNotification = async ({
  recipientId,
  senderId,
  type,
  postId = null,
  connectionId = null,
  conversationId = null,
}) => {
  if (recipientId === senderId) return;

  await pool.query(
    `INSERT INTO notifications (recipient_id, sender_id, type, post_id, connection_id, conversation_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [recipientId, senderId, type, postId, connectionId, conversationId]
  );
};