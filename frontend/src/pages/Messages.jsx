import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../api/axios";
import "../css/Messages.css";

const formatLastSeen = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const Messages = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    setLoadingConvos(true);
    try {
      const res = await api.get("/messages/conversations");
      setConversations(res.data.conversations);
      return res.data.conversations;
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoadingConvos(false);
    }
  };

  const markAsRead = (conversationId, senderId) => {
    if (socket) {
      socket.emit("mark_read", { conversationId, senderId });
    }
  };

  const openConversationWithUser = async (targetUserId) => {
    try {
      const convoRes = await api.post("/messages/conversations", {
        userId: parseInt(targetUserId),
      });
      const conversationId = convoRes.data.conversation.id;

      const profileRes = await api.get(`/profile/${targetUserId}`);
      const otherUser = profileRes.data.user;

      const conversationData = {
        conversation_id: conversationId,
        other_user_id: otherUser.id,
        first_name: otherUser.first_name,
        last_name: otherUser.last_name,
        profile_picture: otherUser.profile_picture,
        last_seen: otherUser.last_seen,
      };

      setActiveConvo(conversationData);

      if (socket) {
        socket.emit("join_conversation", conversationId);
      }

      const messagesRes = await api.get(`/messages/conversations/${conversationId}`);
      setMessages(messagesRes.data.messages);
      markAsRead(conversationId, otherUser.id);
    } catch (err) {
      console.error(err);
    }
  };

  const openConversation = async (convo) => {
    const conversationData = {
      conversation_id: convo.conversation_id,
      other_user_id: convo.other_user_id,
      first_name: convo.first_name,
      last_name: convo.last_name,
      profile_picture: convo.profile_picture,
      last_seen: convo.last_seen,
    };
    setActiveConvo(conversationData);

    if (socket) {
      socket.emit("join_conversation", conversationData.conversation_id);
    }

    try {
      const res = await api.get(`/messages/conversations/${conversationData.conversation_id}`);
      setMessages(res.data.messages);
      markAsRead(conversationData.conversation_id, conversationData.other_user_id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadConversations();
      const targetUserId = searchParams.get("userId");
      if (targetUserId) {
        openConversationWithUser(targetUserId);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message) => {
      if (message.sender_id === user.id) {
        loadConversations();
        return;
      }

      setMessages((prev) => {
        if (activeConvo && message.conversation_id === activeConvo.conversation_id) {
          markAsRead(activeConvo.conversation_id, message.sender_id);
          return [...prev, message];
        }
        return prev;
      });
      loadConversations();
    });

    socket.on("messages_read", ({ conversationId }) => {
      if (activeConvo && conversationId === activeConvo.conversation_id) {
        setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
      }
    });

    socket.on("user_typing", ({ conversationId }) => {
      if (activeConvo && conversationId === activeConvo.conversation_id) {
        setTypingUser(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(false), 3000);
      }
    });

    socket.on("user_online", ({ userId }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    socket.on("user_offline", ({ userId, lastSeen }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      setActiveConvo((prev) =>
        prev && prev.other_user_id === userId ? { ...prev, last_seen: lastSeen } : prev
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("messages_read");
      socket.off("user_typing");
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [socket, activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !socket || !activeConvo) return;

    socket.emit("send_message", {
      conversationId: activeConvo.conversation_id,
      receiverId: activeConvo.other_user_id,
      content: messageText,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        sender_id: user.id,
        content: messageText,
        created_at: new Date().toISOString(),
        is_read: false,
      },
    ]);

    setMessageText("");
  };

  const handleTyping = () => {
    if (socket && activeConvo) {
      socket.emit("typing", {
        conversationId: activeConvo.conversation_id,
        receiverId: activeConvo.other_user_id,
      });
    }
  };

  const isOtherUserOnline = activeConvo && onlineUsers.has(activeConvo.other_user_id);

  return (
    <div className="messages-page">
      <div className="messages-layout">
        <div className={`messages-sidebar ${activeConvo ? "hide-on-mobile" : ""}`}>
          <div className="messages-sidebar-header">
            <h2>Messaging</h2>
          </div>

          {loadingConvos && <div className="messages-loading">Loading...</div>}

          {!loadingConvos && conversations.length === 0 && (
            <div className="messages-empty">No conversations yet.</div>
          )}

          <div className="conversation-list">
            {conversations.map((c) => (
              <div
                key={c.conversation_id}
                className={`conversation-item ${
                  activeConvo?.conversation_id === c.conversation_id ? "active" : ""
                }`}
                onClick={() => openConversation(c)}
              >
                <div className="conversation-avatar-wrap">
                  <div className="conversation-avatar">
                    {c.profile_picture ? (
                      <img src={c.profile_picture} alt={c.first_name} />
                    ) : (
                      <span>{c.first_name?.[0]}</span>
                    )}
                  </div>
                  {onlineUsers.has(c.other_user_id) && <span className="online-dot" />}
                </div>
                <div className="conversation-info">
                  <div className="conversation-name">
                    {c.first_name} {c.last_name}
                  </div>
                  <div className="conversation-last-message">
                    {c.last_message || "No messages yet"}
                  </div>
                </div>
                {c.unread_count > 0 && (
                  <div className="conversation-unread">{c.unread_count}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`messages-chat ${!activeConvo ? "hide-on-mobile" : ""}`}>
          {!activeConvo ? (
            <div className="messages-chat-placeholder">
              Select a conversation to start messaging
            </div>
          ) : (
            <>
              <div className="messages-chat-header">
                <button className="messages-back-btn" onClick={() => setActiveConvo(null)}>
                  ←
                </button>
                <div className="conversation-avatar-wrap">
                  <div className="conversation-avatar">
                    {activeConvo.profile_picture ? (
                      <img src={activeConvo.profile_picture} alt={activeConvo.first_name} />
                    ) : (
                      <span>{activeConvo.first_name?.[0]}</span>
                    )}
                  </div>
                  {isOtherUserOnline && <span className="online-dot" />}
                </div>
                <div>
                  <div className="conversation-name">
                    {activeConvo.first_name} {activeConvo.last_name}
                  </div>
                  <div className="conversation-status">
                    {isOtherUserOnline
                      ? "Online"
                      : activeConvo.last_seen
                      ? `Last seen ${formatLastSeen(activeConvo.last_seen)}`
                      : ""}
                  </div>
                </div>
              </div>

              <div className="messages-chat-body">
                {messages.map((m, idx) => {
                  const isSent = m.sender_id === user.id;
                  const isLastSent = isSent && idx === messages.length - 1;
                  return (
                    <div key={m.id} className={`chat-bubble ${isSent ? "sent" : "received"}`}>
                      {m.content}
                      {isLastSent && (
                        <span className="chat-tick">{m.is_read ? "✓✓" : "✓"}</span>
                      )}
                    </div>
                  );
                })}
                {typingUser && <div className="chat-typing">Typing...</div>}
                <div ref={messagesEndRef} />
              </div>

              <form className="messages-chat-input" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value);
                    handleTyping();
                  }}
                />
                <button type="submit" disabled={!messageText.trim()}>
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;