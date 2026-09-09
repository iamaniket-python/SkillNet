import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CreatePostBox from "../components/CreatePostBox";
import PostCard from "../components/PostCard";
import "../css/Feed.css";

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  const loadPosts = async (pageNum) => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/feed?page=${pageNum}&limit=10`);
      if (res.data.posts.length === 0) setHasMore(false);
      setPosts((prev) =>
        pageNum === 1 ? res.data.posts : [...prev, ...res.data.posts],
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, []);

  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((p) => {
            const next = p + 1;
            loadPosts(next);
            return next;
          });
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore],
  );

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [
      {
        ...newPost,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture: user.profile_picture,
        headline: user.headline,
        author_id: user.id,
        like_count: 0,
        comment_count: 0,
        liked_by_me: false,
      },
      ...prev,
    ]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="feed-page">
      <div className="feed-container">
        <CreatePostBox onPostCreated={handlePostCreated} />

        {posts.map((post, index) => (
          <div
            key={post.id}
            ref={index === posts.length - 1 ? lastPostRef : null}
          >
            <PostCard
              post={post}
              currentUserId={user?.id}
              onDelete={handlePostDeleted}
            />
          </div>
        ))}

        {loading && <div className="feed-loading">Loading posts...</div>}
        {!loading && posts.length === 0 && (
          <div className="feed-empty">
            No posts yet. Be the first to share something!
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <div className="feed-end">You're all caught up 🎉</div>
        )}
      </div>
    </div>
  );
};

export default Feed;
