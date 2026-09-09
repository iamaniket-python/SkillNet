import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification } from "../utils/createNotification.js";

// Send connection request
export const sendRequest = asyncHandler(async (req, res) => {
  const requesterId = req.user.id;
  const { userId: receiverId } = req.body;

  if (parseInt(receiverId) === requesterId) {
    return res.status(400).json({ message: "Cannot connect with yourself" });
  }

  const receiverExists = await pool.query("SELECT id FROM users WHERE id = $1", [
    receiverId,
  ]);
  if (receiverExists.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const existing = await pool.query(
    `SELECT * FROM connections 
     WHERE (requester_id = $1 AND receiver_id = $2) 
        OR (requester_id = $2 AND receiver_id = $1)`,
    [requesterId, receiverId]
  );

  if (existing.rows.length > 0) {
    return res.status(400).json({
      message: `Connection already ${existing.rows[0].status}`,
    });
  }

  const result = await pool.query(
    `INSERT INTO connections (requester_id, receiver_id, status)
     VALUES ($1, $2, 'pending')
     RETURNING *`,
    [requesterId, receiverId]
  );

  await createNotification({
    recipientId: receiverId,
    senderId: requesterId,
    type: "connection_request",
    connectionId: result.rows[0].id,
  });

  res.status(201).json({ connection: result.rows[0] });
});

// Accept / Reject request
export const respondToRequest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { action } = req.body; // "accept" | "reject"

  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  const status = action === "accept" ? "accepted" : "rejected";

  const result = await pool.query(
    `UPDATE connections 
     SET status = $1, updated_at = NOW()
     WHERE id = $2 AND receiver_id = $3 AND status = 'pending'
     RETURNING *`,
    [status, id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Request not found or not authorized" });
  }

  if (status === "accepted") {
    await createNotification({
      recipientId: result.rows[0].requester_id,
      senderId: userId,
      type: "connection_accepted",
      connectionId: result.rows[0].id,
    });
  }

  res.json({ connection: result.rows[0] });
});

// Remove connection / cancel request
export const removeConnection = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await pool.query(
    `DELETE FROM connections 
     WHERE id = $1 AND (requester_id = $2 OR receiver_id = $2)
     RETURNING id`,
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Connection not found" });
  }

  res.json({ message: "Connection removed" });
});

// Get my connections (accepted)
export const getConnections = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await pool.query(
    `SELECT c.id AS connection_id, c.created_at,
       u.id, u.first_name, u.last_name, u.headline, u.profile_picture
     FROM connections c
     JOIN users u ON u.id = CASE 
       WHEN c.requester_id = $1 THEN c.receiver_id 
       ELSE c.requester_id 
     END
     WHERE (c.requester_id = $1 OR c.receiver_id = $1) AND c.status = 'accepted'
     ORDER BY c.updated_at DESC`,
    [userId]
  );

  res.json({ connections: result.rows });
});

// Get pending requests (received)
export const getPendingRequests = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await pool.query(
    `SELECT c.id AS connection_id, c.created_at,
       u.id, u.first_name, u.last_name, u.headline, u.profile_picture
     FROM connections c
     JOIN users u ON u.id = c.requester_id
     WHERE c.receiver_id = $1 AND c.status = 'pending'
     ORDER BY c.created_at DESC`,
    [userId]
  );

  res.json({ requests: result.rows });
});