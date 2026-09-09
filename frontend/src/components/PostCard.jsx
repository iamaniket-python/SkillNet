import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../css/PostCard.css";
import ConfirmModal from "./ConfirmModal";

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
    if (count >= 1) return `${count}${i.label}`;
  }
  return "now";
};

const CommentItem = ({ comment, currentUserId, onDeleted, onUpdated }) => {
  const [liked, setLiked] = useState(comment.liked_by_me);
  const [likeCount, setLikeCount] = useState(parseInt(comment.like_count) || 0);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      await api.post(`/posts/comments/${comment.id}/like`);
    } catch (err) {
      setLiked(liked);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/comments/${comment.id}`);
      onDeleted(comment.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    try {
      const res = await api.put(`/posts/comments/${comment.id}`, { content: editText });
      onUpdated(comment.id, res.data.comment.content);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="comment">
      <Link to={`/profile/${comment.user_id}`} className="comment-avatar">
        {comment.profile_picture ? (
          <img src={comment.profile_picture} alt={comment.first_name} />
        ) : (
          <span>{comment.first_name?.[0]}</span>
        )}
      </Link>
      <div className="comment-body-wrap">
        <div className="comment-body">
          <Link to={`/profile/${comment.user_id}`} className="comment-author">
            {comment.first_name} {comment.last_name}
          </Link>
          {editing ? (
            <div className="comment-edit-form">
              <input value={editText} onChange={(e) => setEditText(e.target.value)} />
              <button onClick={handleUpdate}>Save</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div className="comment-text">{comment.content}</div>
          )}
        </div>
        <div className="comment-actions">
          <button className={liked ? "liked" : ""} onClick={handleLike}>
            👍 {likeCount > 0 && likeCount}
          </button>
          {comment.user_id === currentUserId && !editing && (
            <>
              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post, currentUserId, onDelete }) => {
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likeCount, setLikeCount] = useState(parseInt(post.like_count));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(parseInt(post.comment_count));
  const [loadingComments, setLoadingComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      await api.post(`/posts/${post.id}/like`);
    } catch (err) {
      setLiked(liked);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const res = await api.get(`/posts/${post.id}/comments`);
        setComments(res.data.comments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/posts/${post.id}/comments`, { content: commentText });
      setComments([...comments, res.data.comment]);
      setCommentCount((c) => c + 1);
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentCount((c) => c - 1);
  };

  const handleCommentUpdated = (commentId, newContent) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, content: newContent } : c))
    );
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post.id}`);
      onDelete(post.id);
    } catch (err) {
      console.error(err);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.author_id}`} className="post-avatar">
          {post.profile_picture ? (
            <img src={post.profile_picture} alt={post.first_name} />
          ) : (
            <span>{post.first_name?.[0]}</span>
          )}
        </Link>
        <div className="post-author-info">
          <Link to={`/profile/${post.author_id}`} className="post-author-name">
            {post.first_name} {post.last_name}
          </Link>
          {post.headline && <div className="post-headline">{post.headline}</div>}
          <div className="post-time">{timeAgo(post.created_at)}</div>
        </div>
        {post.author_id === currentUserId && (
          <button className="post-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
            ✕
          </button>
        )}
      </div>

      <div className="post-content">{post.content}</div>

      {post.image_url && (
        <div className="post-image">
          <img src={post.image_url} alt="Post" />
        </div>
      )}

      <div className="post-stats">
        {likeCount > 0 && <span>👍 {likeCount}</span>}
        {commentCount > 0 && <span onClick={toggleComments}>{commentCount} comments</span>}
      </div>

      <div className="post-actions">
        <button className={`post-action-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
          👍 Like
        </button>
        <button className="post-action-btn" onClick={toggleComments}>
          💬 Comment
        </button>
      </div>

      {showComments && (
        <div className="post-comments">
          {loadingComments && <div className="comments-loading">Loading comments...</div>}

          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              onDeleted={handleCommentDeleted}
              onUpdated={handleCommentUpdated}
            />
          ))}

          <form className="comment-form" onSubmit={handleAddComment}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" disabled={!commentText.trim()}>
              Post
            </button>
          </form>
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete post?"
          message="This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

export default PostCard;