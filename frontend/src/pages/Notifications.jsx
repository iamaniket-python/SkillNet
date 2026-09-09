import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../css/Notifications.css";

const timeAgo = (dateString) => {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  const intervals = [
    { label: "y", secs: 31536000 },
    { label: "mo", secs: 2592000 },
    { label: "d", secs: 86400 },
    { label: "h", secs: 3600 },
    { label: "m", secs: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count}${i.label} ago`;
  }
  return "just now";
};

const notificationText = (n) => {
  switch (n.type) {
    case "like":
      return "liked your post";
    case "comment":
      return "commented on your post";
    case "connection_request":
      return "sent you a connection request";
    case "connection_accepted":
      return "accepted your connection request";
    default:
      return "";
  }
};

const notificationLink = (n) => {
  if (n.type === "like" || n.type === "comment") return `/post/${n.post_id}`;
  if (n.type === "connection_request") return "/network";
  if (n.type === "connection_accepted") return `/profile/${n.sender_id}`;
  return "#";
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.is_read) {
      try {
        await api.patch(`/notifications/${n.id}/read`);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <h1>Notifications</h1>
          {notifications.some((n) => !n.is_read) && (
            <button className="notifications-mark-read" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {loading && <div className="notifications-loading">Loading...</div>}

        {!loading && notifications.length === 0 && (
          <div className="notifications-empty">No notifications yet.</div>
        )}

        <div className="notifications-list">
          {notifications.map((n) => (
            <Link
              key={n.id}
              to={notificationLink(n)}
              className={`notification-item ${!n.is_read ? "unread" : ""}`}
              onClick={() => handleNotificationClick(n)}
            >
              <div className="notification-avatar">
                {n.sender_profile_picture ? (
                  <img src={n.sender_profile_picture} alt={n.sender_first_name} />
                ) : (
                  <span>{n.sender_first_name?.[0]}</span>
                )}
              </div>
              <div className="notification-content">
                <div className="notification-text">
                  <strong>
                    {n.sender_first_name} {n.sender_last_name}
                  </strong>{" "}
                  {notificationText(n)}
                </div>
                <div className="notification-time">{timeAgo(n.created_at)}</div>
              </div>
              {!n.is_read && <div className="notification-dot" />}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;