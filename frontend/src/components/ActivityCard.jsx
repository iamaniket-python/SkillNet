import { useState, useEffect } from "react";
import api from "../api/axios";
import PostCard from "./PostCard";
import "../css/ActivityCard.css";

const ActivityCard = ({ profileId, currentUserId }) => {
  const [summary, setSummary] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showPosts, setShowPosts] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await api.get(`/activity/${profileId}/summary`);
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadSummary();
  }, [profileId]);

  const togglePosts = async () => {
    if (!showPosts && posts.length === 0) {
      setLoadingPosts(true);
      try {
        const res = await api.get(`/activity/${profileId}/posts?limit=5`);
        setPosts(res.data.posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }
    }
    setShowPosts(!showPosts);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (!summary) return null;

  return (
    <div className="profile-card profile-section activity-card">
      <div className="profile-section-header">
        <h2>Activity</h2>
      </div>

      <div className="activity-summary" onClick={togglePosts}>
        <span>
          <strong>{summary.posts}</strong> posts
        </span>
        <span>
          <strong>{summary.comments}</strong> comments
        </span>
        <span>
          <strong>{summary.likes}</strong> likes given
        </span>
      </div>

      {summary.posts === 0 && (
        <p className="profile-empty-text">No activity yet.</p>
      )}

      {summary.posts > 0 && (
        <button className="activity-toggle-btn" onClick={togglePosts}>
          {showPosts ? "Hide posts" : "Show recent posts"}
        </button>
      )}

      {showPosts && (
        <div className="activity-posts">
          {loadingPosts && <div className="comments-loading">Loading posts...</div>}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDelete={handlePostDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityCard;