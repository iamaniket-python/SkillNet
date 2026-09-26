import { useState } from "react";
import api from "../api/axios";

const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
};

const ProjectForm = ({ project, onSaved, onCancel }) => {
  const isEditMode = Boolean(project);

  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    techStack: project?.tech_stack || "",
    githubUrl: project?.github_url || "",
    liveUrl: project?.live_url || "",
    startDate: toInputDate(project?.start_date),
    endDate: toInputDate(project?.end_date),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      const res = isEditMode
        ? await api.put(`/projects/${project.id}`, payload)
        : await api.post("/projects", payload);

      onSaved(res.data.project, isEditMode);
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}

      <div className="form-group">
        <label>Project title</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. E-commerce Platform"
          required
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="What does this project do?"
        />
      </div>
      <div className="form-group">
        <label>Tech stack</label>
        <input
          name="techStack"
          value={formData.techStack}
          onChange={handleChange}
          placeholder="e.g. React, Node.js, PostgreSQL"
        />
      </div>
      <div className="form-group">
        <label>GitHub URL</label>
        <input
          name="githubUrl"
          value={formData.githubUrl}
          onChange={handleChange}
          placeholder="https://github.com/username/repo"
        />
      </div>
      <div className="form-group">
        <label>Live URL (optional)</label>
        <input
          name="liveUrl"
          value={formData.liveUrl}
          onChange={handleChange}
          placeholder="https://myproject.com"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Start date (optional)</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>End date (optional)</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
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

export default ProjectForm;