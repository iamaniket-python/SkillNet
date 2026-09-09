import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../css/Search.css";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingIds, setConnectingIds] = useState([]);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) return;
      setLoading(true);
      try {
        const res = await api.get(`/search/users?q=${encodeURIComponent(query)}`);
        setUsers(res.data.users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [query]);

  const handleConnect = async (userId) => {
    setConnectingIds((prev) => [...prev, userId]);
    try {
      await api.post("/connections/request", { userId });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, connection_status: "pending" } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessage = (userId) => {
    navigate(`/messages?userId=${userId}`);
  };

  const renderConnectionButton = (u) => {
    if (u.connection_status === "accepted") {
      return (
        <button className="btn-outline" disabled>
          ✓ Connected
        </button>
      );
    }
    if (u.connection_status === "pending") {
      return (
        <button className="btn-outline" disabled>
          Pending
        </button>
      );
    }
    return (
      <button
        className="btn-outline"
        onClick={() => handleConnect(u.id)}
        disabled={connectingIds.includes(u.id)}
      >
        + Connect
      </button>
    );
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h2 className="search-title">
          Search results for "<span>{query}</span>"
        </h2>

        {loading && <div className="search-loading">Searching...</div>}

        {!loading && users.length === 0 && (
          <div className="search-empty">No users found for "{query}"</div>
        )}

        <div className="search-results">
          {users.map((u) => (
            <div key={u.id} className="search-result-item">
              <Link to={`/profile/${u.id}`} className="search-result-avatar">
                {u.profile_picture ? (
                  <img src={u.profile_picture} alt={u.first_name} />
                ) : (
                  <span>{u.first_name?.[0]}</span>
                )}
              </Link>
              <div className="search-result-info">
                <Link to={`/profile/${u.id}`} className="search-result-name">
                  {u.first_name} {u.last_name}
                </Link>
                {u.headline && <div className="search-result-headline">{u.headline}</div>}
                {u.location && <div className="search-result-location">{u.location}</div>}
              </div>
              <div className="search-result-action">
                <button className="btn-outline" onClick={() => handleMessage(u.id)}>
                  Message
                </button>
                {renderConnectionButton(u)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;