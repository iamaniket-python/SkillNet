import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../css/CreatePostBox.css";

const CreatePostBox = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG and PNG images are allowed");
      e.target.value = "";
      return;
    }

    const data = new FormData();
    data.append("image", file);

    setUploading(true);

    try {
      const res = await api.post("/upload/image", data);
      console.log("Upload response:", res.data);

      setImageUrl(res.data.imageUrl);
    } catch (err) {
      console.error("Upload error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;
    setPosting(true);
    try {
      const res = await api.post("/posts", { content, imageUrl });
      onPostCreated(res.data.post);
      setContent("");
      setImageUrl(null);
      setExpanded(false);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="create-post-box">
      <div className="create-post-top">
        <div className="create-post-avatar">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt={user.firstName} />
          ) : (
            <span>{user?.firstName?.[0]}</span>
          )}
        </div>
        {!expanded ? (
          <button
            className="create-post-trigger"
            onClick={() => setExpanded(true)}
          >
            Start a post
          </button>
        ) : (
          <form className="create-post-form" onSubmit={handleSubmit}>
            <textarea
              autoFocus
              placeholder="What do you want to talk about?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </form>
        )}
      </div>

      {expanded && imageUrl && (
        <div className="create-post-image-preview">
          <img src={imageUrl} alt="Preview" />
          <button type="button" onClick={() => setImageUrl(null)}>
            ✕
          </button>
        </div>
      )}

      {expanded && (
        <div className="create-post-footer">
          <label className="create-post-image-btn">
            {uploading ? "Uploading..." : "📷 Photo"}
            <input
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              hidden
              onChange={handleImageSelect}
              disabled={uploading}
            />
          </label>

          <div className="create-post-footer-buttons">
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setExpanded(false);
                setContent("");
                setImageUrl(null);
              }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageUrl) || posting || uploading}
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePostBox;
