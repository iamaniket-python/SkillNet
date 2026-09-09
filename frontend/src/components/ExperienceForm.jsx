import { useState } from "react";
import api from "../api/axios";

const ExperienceForm = ({ onAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post("/profile/experience", {
        ...formData,
        endDate: formData.endDate || null,
      });
      onAdded(res.data.experience);
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
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default ExperienceForm;