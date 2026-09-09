import { useState } from "react";
import api from "../api/axios";
import "../css/EditProfileModal.css";

const EditProfileModal = ({ profile, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    headline: profile.headline || "",
    location: profile.location || "",
    about: profile.about || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [profilePicture, setProfilePicture] = useState(profile.profile_picture);
  const [bannerImage, setBannerImage] = useState(profile.banner_image);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);

    setUploadingPic(true);
    try {
      const res = await api.post("/upload/profile-picture", data);
      console.log("Profile pic response:", res.data);
      setProfilePicture(res.data.user.profile_picture);
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      alert("Failed to upload profile picture");
    } finally {
      setUploadingPic(false);
    }
  };
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);

    setUploadingBanner(true);
    try {
      const res = await api.post("/upload/banner", data);
      console.log("Banner response:", res.data);
      setBannerImage(res.data.user.banner_image);
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      alert("Failed to upload banner image");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/profile", formData);
      onSaved({
        ...res.data.user,
        profile_picture: profilePicture,
        banner_image: bannerImage,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit profile</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          className="modal-banner-preview"
          style={bannerImage ? { backgroundImage: `url(${bannerImage})` } : {}}
        >
          <label className="modal-upload-btn modal-banner-upload-btn">
            {uploadingBanner ? "Uploading..." : "📷 Change banner"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleBannerUpload}
              disabled={uploadingBanner}
            />
          </label>
        </div>

        <div className="modal-avatar-preview">
          <div className="modal-avatar-circle">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" />
            ) : (
              <span>{profile.first_name?.[0]}</span>
            )}
          </div>
          <label className="modal-upload-btn">
            {uploadingPic ? "Uploading..." : "📷 Change photo"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleProfilePicUpload}
              disabled={uploadingPic}
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Headline</label>
            <input
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              placeholder="e.g. Software Engineer at Google"
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bengaluru, India"
            />
          </div>
          <div className="form-group">
            <label>About</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={5}
              placeholder="Tell people about yourself"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
