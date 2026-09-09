import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../css/AnalyticsCard.css";

const timeAgo = (dateString) => {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  const intervals = [
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

const AnalyticsCard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [showViewers, setShowViewers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !analytics) return null;

  return (
    <div className="profile-card profile-section analytics-card">
      <h2>Analytics</h2>
      <p className="analytics-subtitle">Private to you</p>

      <div className="analytics-stats">
        <div className="analytics-stat" onClick={() => setShowViewers(!showViewers)}>
          <div className="analytics-stat-value">{analytics.profileViews}</div>
          <div className="analytics-stat-label">Profile views</div>
          <div className="analytics-stat-sub">Last 90 days</div>
        </div>

        <div className="analytics-stat">
          <div className="analytics-stat-value">{analytics.searchAppearances}</div>
          <div className="analytics-stat-label">Search appearances</div>
          <div className="analytics-stat-sub">Last 7 days</div>
        </div>
      </div>

      {showViewers && (
        <div className="analytics-viewers">
          {analytics.recentViewers.length === 0 && (
            <p className="profile-empty-text">No profile views yet.</p>
          )}
          {analytics.recentViewers.map((v) => (
            <Link key={v.id} to={`/profile/${v.id}`} className="analytics-viewer-item">
              <div className="analytics-viewer-avatar">
                {v.profile_picture ? (
                  <img src={v.profile_picture} alt={v.first_name} />
                ) : (
                  <span>{v.first_name?.[0]}</span>
                )}
              </div>
              <div className="analytics-viewer-info">
                <div className="analytics-viewer-name">
                  {v.first_name} {v.last_name}
                </div>
                {v.headline && <div className="analytics-viewer-headline">{v.headline}</div>}
              </div>
              <div className="analytics-viewer-time">{timeAgo(v.created_at)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsCard;