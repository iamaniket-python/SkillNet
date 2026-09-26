import { useState } from "react";
import api from "../api/axios";

// backend se aayi date (ISO string / timestamp) ko <input type="date"> ke
// liye YYYY-MM-DD format mein convert karta hai
const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
};

const ExperienceForm = ({ experience, onSaved, onCancel }) => {
  const isEditMode = Boolean(experience);

  const [formData, setFormData] = useState({
    title: experience?.title || "",
    company: experience?.company || "",
    location: experience?.location || "",
    startDate: toInputDate(experience?.start_date),
    endDate: toInputDate(experience?.end_date),
    description: experience?.description || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        endDate: formData.endDate || null,
      };

      const res = isEditMode
        ? await api.put(`/profile/experience/${experience.id}`, payload)
        : await api.post("/profile/experience", payload);

      onSaved(res.data.experience, isEditMode);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Title</label>
        <input name="title" value={formData.title} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Company</label>
        <input name="company" value={formData.company} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Location</label>
        <input name="location" value={formData.location} onChange={handleChange} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Start date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>End date (leave blank if current)</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
        </div>
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} />
      </div>
      <div className="inline-form-actions">
        <button type="button" className="btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : isEditMode ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default ExperienceForm;