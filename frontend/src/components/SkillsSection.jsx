import { useState, useEffect } from "react";
import api from "../api/axios";
import "../css/SkillsSection.css";

const SkillsSection = ({ profileId, isOwnProfile }) => {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadSkills = async () => {
    try {
      const res = await api.get(`/skills/user/${profileId}`);
      setSkills(res.data.skills);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSkills();
  }, [profileId]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    setError("");
    setSaving(true);
    try {
      const res = await api.post("/skills", { name: newSkill.trim() });
      setSkills((prev) => [res.data.skill, ...prev]);
      setNewSkill("");
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add skill");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm("Remove this skill?")) return;
    try {
      await api.delete(`/skills/${skillId}`);
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndorse = async (skillId) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skillId
          ? {
              ...s,
              endorsed_by_me: !s.endorsed_by_me,
              endorsement_count: s.endorsed_by_me
                ? parseInt(s.endorsement_count) - 1
                : parseInt(s.endorsement_count) + 1,
            }
          : s
      )
    );
    try {
      await api.post(`/skills/${skillId}/endorse`);
    } catch (err) {
      console.error(err);
      loadSkills(); // revert on failure
    }
  };

  return (
    <div className="profile-card profile-section">
      <div className="profile-section-header">
        <h2>Skills</h2>
        {isOwnProfile && (
          <button className="profile-add-btn" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "✕" : "+"}
          </button>
        )}
      </div>

      {showAddForm && (
        <form className="skill-add-form" onSubmit={handleAddSkill}>
          {error && <div className="auth-error">{error}</div>}
          <input
            type="text"
            placeholder="e.g. JavaScript, Project Management"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary" disabled={!newSkill.trim() || saving}>
            {saving ? "Adding..." : "Add"}
          </button>
        </form>
      )}

      {skills.length === 0 && !showAddForm && (
        <p className="profile-empty-text">No skills added yet.</p>
      )}

      {skills.length > 0 && (
        <div className="skills-list">
          {skills.map((skill) => (
            <div key={skill.id} className="skill-chip">
              <span className="skill-name">{skill.name}</span>

              {parseInt(skill.endorsement_count) > 0 && (
                <span className="skill-endorsement-count">
                  {skill.endorsement_count}
                </span>
              )}

              {!isOwnProfile && (
                <button
                  className={`skill-endorse-btn ${skill.endorsed_by_me ? "endorsed" : ""}`}
                  onClick={() => handleEndorse(skill.id)}
                  title={skill.endorsed_by_me ? "Remove endorsement" : "Endorse this skill"}
                >
                  👍
                </button>
              )}

              {isOwnProfile && (
                <button
                  className="skill-delete-btn"
                  onClick={() => handleDeleteSkill(skill.id)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsSection;