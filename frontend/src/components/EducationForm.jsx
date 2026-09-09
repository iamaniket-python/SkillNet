import { useState } from "react";
import api from "../api/axios";

const EducationForm = ({ onAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post("/profile/education", {
        ...formData,
        endDate: formData.endDate || null,
      });
      onAdded(res.data.education);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>School</label>
        <input name="school" value={formData.school} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Degree</label>
        <input name="degree" value={formData.degree} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Field of study</label>
        <input name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} />
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
          <label>End date</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
        </div>
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

export default EducationForm;