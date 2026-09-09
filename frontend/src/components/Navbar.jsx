import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../css/Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const searchWrapRef = useRef(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get("/notifications/unread-count");
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error("Failed to fetch unread count", err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const runSearch = (q) => {
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setShowHistory(false);
    setShowMobileSearch(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(searchQuery);
  };

  const handleFocus = async () => {
    try {
      const res = await api.get("/search/history");
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
    }
    setShowHistory(true);
  };

  const handleHistoryClick = (q) => {
    setSearchQuery(q);
    runSearch(q);
  };

  const handleRemoveHistory = async (e, q) => {
    e.stopPropagation();
    try {
      await api.delete(`/search/history/${encodeURIComponent(q)}`);
      setHistory((prev) => prev.filter((item) => item !== q));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="navbar">
      {!showMobileSearch ? (
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            SkillNet
          </Link>

          <div className="navbar-search" ref={searchWrapRef}>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleFocus}
              />
            </form>

            {showHistory && history.length > 0 && (
              <div className="search-history-dropdown">
                <div className="search-history-label">Recent searches</div>
                {history.map((q) => (
                  <div
                    key={q}
                    className="search-history-item"
                    onClick={() => handleHistoryClick(q)}
                  >
                    <span className="search-history-icon">🕐</span>
                    <span className="search-history-text">{q}</span>
                    <button
                      className="search-history-remove"
                      onClick={(e) => handleRemoveHistory(e, q)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="navbar-mobile-search-btn"
            onClick={() => setShowMobileSearch(true)}
          >
            🔍
          </button>

          <div className="navbar-links">
            <Link to="/" className="navbar-link">
              <span className="navbar-icon">🏠</span>
              <span className="navbar-label">Home</span>
            </Link>

            <Link to="/network" className="navbar-link">
              <span className="navbar-icon">👥</span>
              <span className="navbar-label">Network</span>
            </Link>

            <Link to="/messages" className="navbar-link">
              <span className="navbar-icon">💬</span>
              <span className="navbar-label">Messaging</span>
            </Link>

            <Link to="/notifications" className="navbar-link">
              <span className="navbar-icon" style={{ position: "relative" }}>
                🔔
                {unreadCount > 0 && <span className="navbar-badge">{unreadCount}</span>}
              </span>
              <span className="navbar-label">Notifications</span>
            </Link>

            <div className="navbar-profile" onClick={() => setShowMenu(!showMenu)}>
              <div className="navbar-avatar">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user.firstName} />
                ) : (
                  <span>{user?.firstName?.[0]}</span>
                )}
              </div>
              <span className="navbar-label">Me</span>

              {showMenu && (
                <div className="navbar-dropdown">
                  <Link to={`/profile/${user?.id}`} onClick={() => setShowMenu(false)}>
                    View Profile
                  </Link>
                  <button onClick={handleLogout}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="navbar-mobile-search-bar">
          <button className="navbar-back-btn" onClick={() => setShowMobileSearch(false)}>
            ←
          </button>
          <div className="navbar-mobile-search-form-wrap">
            <form onSubmit={handleSearch} className="navbar-mobile-search-form">
              <input
                type="text"
                autoFocus
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleFocus}
              />
            </form>

            {showHistory && history.length > 0 && (
              <div className="search-history-dropdown mobile">
                <div className="search-history-label">Recent searches</div>
                {history.map((q) => (
                  <div
                    key={q}
                    className="search-history-item"
                    onClick={() => handleHistoryClick(q)}
                  >
                    <span className="search-history-icon">🕐</span>
                    <span className="search-history-text">{q}</span>
                    <button
                      className="search-history-remove"
                      onClick={(e) => handleRemoveHistory(e, q)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;