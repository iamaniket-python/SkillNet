import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../css/Network.css";

const Network = () => {
  const [pending, setPending] = useState([]);
  const [connections, setConnections] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("suggestions");

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, connectionsRes, suggestedRes] = await Promise.all([
        api.get("/connections/pending"),
        api.get("/connections"),
        api.get("/search/suggested?limit=12"),
      ]);
      setPending(pendingRes.data.requests);
      setConnections(connectionsRes.data.connections);
      setSuggested(suggestedRes.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConnect = async (userId) => {
    try {
      await api.post("/connections/request", { userId });
      setSuggested((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespond = async (connectionId, action) => {
    try {
      await api.patch(`/connections/${connectionId}/respond`, { action });
      setPending((prev) => prev.filter((p) => p.connection_id !== connectionId));
      if (action === "accept") loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (connectionId) => {
    if (!window.confirm("Remove this connection?")) return;
    try {
      await api.delete(`/connections/${connectionId}`);
      setConnections((prev) => prev.filter((c) => c.connection_id !== connectionId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="network-page">
      <div className="network-container">
        <div className="network-tabs">
          <button
            className={activeTab === "suggestions" ? "active" : ""}
            onClick={() => setActiveTab("suggestions")}
          >
            Suggestions
          </button>
          <button
            className={activeTab === "pending" ? "active" : ""}
            onClick={() => setActiveTab("pending")}
          >
            Pending {pending.length > 0 && `(${pending.length})`}
          </button>
          <button
            className={activeTab === "connections" ? "active" : ""}
            onClick={() => setActiveTab("connections")}
          >
            Connections ({connections.length})
          </button>
        </div>

        {loading && <div className="network-loading">Loading...</div>}

        {!loading && activeTab === "suggestions" && (
          <div className="network-grid">
            {suggested.length === 0 && (
              <div className="network-empty">No suggestions right now.</div>
            )}
            {suggested.map((u) => (
              <div key={u.id} className="network-card">
                <Link to={`/profile/${u.id}`} className="network-card-avatar">
                  {u.profile_picture ? (
                    <img src={u.profile_picture} alt={u.first_name} />
                  ) : (
                    <span>{u.first_name?.[0]}</span>
                  )}
                </Link>
                <Link to={`/profile/${u.id}`} className="network-card-name">
                  {u.first_name} {u.last_name}
                </Link>
                {u.headline && <div className="network-card-headline">{u.headline}</div>}
                <button className="btn-outline btn-full" onClick={() => handleConnect(u.id)}>
                  + Connect
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && activeTab === "pending" && (
          <div className="network-list">
            {pending.length === 0 && (
              <div className="network-empty">No pending requests.</div>
            )}
            {pending.map((p) => (
              <div key={p.connection_id} className="network-list-item">
                <Link to={`/profile/${p.id}`} className="network-list-avatar">
                  {p.profile_picture ? (
                    <img src={p.profile_picture} alt={p.first_name} />
                  ) : (
                    <span>{p.first_name?.[0]}</span>
                  )}
                </Link>
                <div className="network-list-info">
                  <Link to={`/profile/${p.id}`} className="network-list-name">
                    {p.first_name} {p.last_name}
                  </Link>
                  {p.headline && <div className="network-list-headline">{p.headline}</div>}
                </div>
                <div className="network-list-actions">
                  <button
                    className="btn-primary"
                    onClick={() => handleRespond(p.connection_id, "accept")}
                  >
                    Accept
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => handleRespond(p.connection_id, "reject")}
                  >
                    Ignore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && activeTab === "connections" && (
          <div className="network-list">
            {connections.length === 0 && (
              <div className="network-empty">No connections yet.</div>
            )}
            {connections.map((c) => (
              <div key={c.connection_id} className="network-list-item">
                <Link to={`/profile/${c.id}`} className="network-list-avatar">
                  {c.profile_picture ? (
                    <img src={c.profile_picture} alt={c.first_name} />
                  ) : (
                    <span>{c.first_name?.[0]}</span>
                  )}
                </Link>
                <div className="network-list-info">
                  <Link to={`/profile/${c.id}`} className="network-list-name">
                    {c.first_name} {c.last_name}
                  </Link>
                  {c.headline && <div className="network-list-headline">{c.headline}</div>}
                </div>
                <div className="network-list-actions">
                  <button className="btn-outline" onClick={() => handleRemove(c.connection_id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;