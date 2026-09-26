import { useState } from "react";
import api from "../api/axios";

const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
};

const EducationForm = ({ education, onSaved, onCancel }) => {
  const isEditMode = Boolean(education);

  const [formData, setFormData] = useState({
    school: education?.school || "",
    degree: education?.degree || "",
    fieldOfStudy: education?.field_of_study || "",
    startDate: toInputDate(education?.start_date),
    endDate: toInputDate(education?.end_date),
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
        ? await api.put(`/profile/education/${education.id}`, payload)
        : await api.post("/profile/education", payload);

      onSaved(res.data.education, isEditMode);
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
          {saving ? "Saving..." : isEditMode ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default EducationForm;