import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const onlineUsers = new Map();

export const initSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error: no token"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} connected`);

    socket.broadcast.emit("user_online", { userId });

    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on("send_message", async ({ conversationId, receiverId, content }) => {
      try {
        const result = await pool.query(
          `INSERT INTO messages (conversation_id, sender_id, content)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [conversationId, userId, content]
        );

        const message = result.rows[0];

        io.to(`conversation_${conversationId}`).emit("receive_message", message);

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }
      } catch (err) {
        socket.emit("message_error", { message: "Failed to send message" });
      }
    });

    // Naya: message read receipt
    socket.on("mark_read", async ({ conversationId, senderId }) => {
      try {
        await pool.query(
          "UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_id != $2",
          [conversationId, userId]
        );

        // sender ko batao ki unke messages read ho gaye
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messages_read", { conversationId, readBy: userId });
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("typing", ({ conversationId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", { conversationId, userId });
      }
    });

    socket.on("stop_typing", ({ conversationId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_stop_typing", { conversationId, userId });
      }
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      try {
        await pool.query("UPDATE users SET last_seen = NOW() WHERE id = $1", [userId]);
      } catch (err) {
        console.error(err);
      }
      socket.broadcast.emit("user_offline", { userId, lastSeen: new Date().toISOString() });
      console.log(`User ${userId} disconnected`);
    });
  });

  // helper: check karne ke liye koi user online hai ya nahi (API se use ho sakta hai)
  io.isUserOnline = (userId) => onlineUsers.has(userId);
};