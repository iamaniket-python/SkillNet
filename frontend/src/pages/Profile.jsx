import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import EditProfileModal from "../components/EditProfileModal";
import AnalyticsCard from "../components/AnalyticsCard";
import ActivityCard from "../components/ActivityCard";
import ExperienceForm from "../components/ExperienceForm";
import EducationForm from "../components/EducationForm";
import CertificateForm from "../components/CertificateForm";
import ProjectForm from "../components/ProjectForm";
import SkillsSection from "../components/SkillsSection";
import "../css/Profile.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "Present";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  // NEW: tracks which experience (if any) is currently being edited
  const [editingExperience, setEditingExperience] = useState(null);

  const isOwnProfile = currentUser?.id === parseInt(id, 10);

  const handleConnect = async () => {
    if (connectLoading) return;
    setConnectLoading(true);
    try {
      await api.post("/connections/request", { userId: profile.id });
      setProfile((prev) => ({ ...prev, connection_status: "pending" }));
    } catch (err) {
      console.error(err);
      setError("Couldn't send connection request. Please try again.");
    } finally {
      setConnectLoading(false);
    }
  };

  const handleMessage = () => {
    navigate(`/messages?userId=${profile.id}`);
  };

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/profile/${id}`);
      setProfile(res.data.user);
      setExperiences(res.data.experiences);
      setEducation(res.data.education);
      setCertificates(res.data.certificates);
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
      setError("Couldn't load this profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  const handleProfileUpdated = (updatedUser) => {
    setProfile((prev) => ({ ...prev, ...updatedUser }));
    if (isOwnProfile) setUser((prev) => ({ ...prev, ...updatedUser }));
    setShowEditModal(false);
  };

  // UPDATED: now handles both add and edit for experience
  const handleExperienceSaved = (exp, isEditMode) => {
    if (isEditMode) {
      setExperiences((prev) => prev.map((e) => (e.id === exp.id ? exp : e)));
    } else {
      setExperiences((prev) => [exp, ...prev]);
    }
    setShowExpForm(false);
    setEditingExperience(null);
  };

  const handleExperienceDeleted = async (expId) => {
    if (!window.confirm("Delete this experience?")) return;
    try {
      await api.delete(`/profile/experience/${expId}`);
      setExperiences((prev) => prev.filter((e) => e.id !== expId));
    } catch (err) {
      console.error(err);
      setError("Couldn't delete this experience. Please try again.");
    }
  };

  const handleEducationAdded = (edu) => {
    setEducation((prev) => [edu, ...prev]);
    setShowEduForm(false);
  };

  const handleCertificateAdded = (cert) => {
    setCertificates((prev) => [cert, ...prev]);
    setShowCertForm(false);
  };

  const handleProjectAdded = (project) => {
    setProjects((prev) => [project, ...prev]);
    setShowProjectForm(false);
  };

  const handleEducationDeleted = async (eduId) => {
    if (!window.confirm("Delete this education?")) return;
    try {
      await api.delete(`/profile/education/${eduId}`);
      setEducation((prev) => prev.filter((e) => e.id !== eduId));
    } catch (err) {
      console.error(err);
      setError("Couldn't delete this education entry. Please try again.");
    }
  };

  const handleProjectDeleted = async (projectId) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error(err);
      setError("Couldn't delete this project. Please try again.");
    }
  };

  const handleCertificateDeleted = async (certId) => {
    if (!window.confirm("Delete this certificate?")) return;
    try {
      await api.delete(`/certificates/${certId}`);
      setCertificates((prev) => prev.filter((c) => c.id !== certId));
    } catch (err) {
      console.error(err);
      setError("Couldn't delete this certificate. Please try again.");
    }
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (!profile)
    return (
      <div className="profile-loading">
        {error || "Profile not found."}
        <button
          className="btn-outline"
          onClick={loadProfile}
          style={{ marginLeft: 12 }}
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="profile-page">
      <div className="profile-container">
        {error && (
          <div className="profile-error-banner" role="alert">
            {error}
            <button onClick={() => setError(null)} aria-label="Dismiss error">
              ✕
            </button>
          </div>
        )}

        <div className="profile-card">
          <div
            className="profile-banner"
            style={
              profile.banner_image
                ? { backgroundImage: `url(${profile.banner_image})` }
                : {}
            }
          />
          <div className="profile-header-content">
            <div className="profile-avatar-large">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={`${profile.first_name} ${profile.last_name}`}
                />
              ) : (
                <span>{profile.first_name?.[0]}</span>
              )}
            </div>

            {isOwnProfile && (
              <button
                className="profile-edit-btn"
                onClick={() => setShowEditModal(true)}
              >
                ✎ Edit
              </button>
            )}
            {!isOwnProfile && (
              <div className="profile-action-btn">
                <button className="btn-outline" onClick={handleMessage}>
                  Message
                </button>
                {profile.connection_status === "accepted" ? (
                  <button className="btn-outline" disabled>
                    ✓ Connected
                  </button>
                ) : profile.connection_status === "pending" ? (
                  <button className="btn-outline" disabled>
                    Pending
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={handleConnect}
                    disabled={connectLoading}
                  >
                    {connectLoading ? "Sending..." : "+ Connect"}
                  </button>
                )}
              </div>
            )}
            <h1 className="profile-name">
              {profile.first_name} {profile.last_name}
            </h1>
            {profile.headline && (
              <p className="profile-headline">{profile.headline}</p>
            )}
            {profile.location && (
              <p className="profile-location">{profile.location}</p>
            )}
          </div>
        </div>

        {isOwnProfile && <AnalyticsCard />}

        {profile.about && (
          <div className="profile-card profile-section">
            <h2>About</h2>
            <p className="profile-about-text">{profile.about}</p>
          </div>
        )}

        <ActivityCard profileId={profile.id} currentUserId={currentUser?.id} />

        {/* ---------- EXPERIENCE (Edit wired) ---------- */}
        <div className="profile-card profile-section">
          <div className="profile-section-header">
            <h2>Experience</h2>
            {isOwnProfile && (
              <button
                className="profile-add-btn"
                onClick={() => {
                  setEditingExperience(null);
                  setShowExpForm(!showExpForm);
                }}
              >
                {showExpForm ? "✕" : "+"}
              </button>
            )}
          </div>

          {(showExpForm || editingExperience) && (
            <ExperienceForm
              experience={editingExperience}
              onSaved={handleExperienceSaved}
              onCancel={() => {
                setShowExpForm(false);
                setEditingExperience(null);
              }}
            />
          )}

          {experiences.length === 0 && !showExpForm && (
            <p className="profile-empty-text">No experience added yet.</p>
          )}

          {experiences.map((exp) => (
            <div key={exp.id} className="profile-item">
              <div className="profile-item-icon">💼</div>
              <div className="profile-item-content">
                <div className="profile-item-title">{exp.title}</div>
                <div className="profile-item-subtitle">{exp.company}</div>
                <div className="profile-item-meta">
                  {formatDate(exp.start_date)} – {formatDate(exp.end_date)}
                  {exp.location && ` · ${exp.location}`}
                </div>
                {exp.description && (
                  <p className="profile-item-description">{exp.description}</p>
                )}
              </div>
              {isOwnProfile && (
                <div className="profile-item-actions">
                  <button
                    className="profile-item-edit"
                    onClick={() => {
                      setShowExpForm(false);
                      setEditingExperience(exp);
                    }}
                    aria-label={`Edit ${exp.title} experience`}
                  >
                    ✎
                  </button>
                  <button
                    className="profile-item-delete"
                    onClick={() => handleExperienceDeleted(exp.id)}
                    aria-label={`Delete ${exp.title} experience`}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ---------- EDUCATION (unchanged for now) ---------- */}
        <div className="profile-card profile-section">
          <div className="profile-section-header">
            <h2>Education</h2>
            {isOwnProfile && (
              <button
                className="profile-add-btn"
                onClick={() => setShowEduForm(!showEduForm)}
              >
                {showEduForm ? "✕" : "+"}
              </button>
            )}
          </div>

          {showEduForm && (
            <EducationForm
              onAdded={handleEducationAdded}
              onCancel={() => setShowEduForm(false)}
            />
          )}

          {education.length === 0 && !showEduForm && (
            <p className="profile-empty-text">No education added yet.</p>
          )}

          {education.map((edu) => (
            <div key={edu.id} className="profile-item">
              <div className="profile-item-icon">🎓</div>
              <div className="profile-item-content">
                <div className="profile-item-title">{edu.school}</div>
                {edu.degree && (
                  <div className="profile-item-subtitle">
                    {edu.degree}
                    {edu.field_of_study && `, ${edu.field_of_study}`}
                  </div>
                )}
                <div className="profile-item-meta">
                  {formatDate(edu.start_date)} – {formatDate(edu.end_date)}
                </div>
              </div>
              {isOwnProfile && (
                <button
                  className="profile-item-delete"
                  onClick={() => handleEducationDeleted(edu.id)}
                  aria-label={`Delete ${edu.school} education entry`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ---------- CERTIFICATES (unchanged for now) ---------- */}
        <div className="profile-card profile-section">
          <div className="profile-section-header">
            <h2>Licenses & Certificates</h2>
            {isOwnProfile && (
              <button
                className="profile-add-btn"
                onClick={() => setShowCertForm(!showCertForm)}
              >
                {showCertForm ? "✕" : "+"}
              </button>
            )}
          </div>

          {showCertForm && (
            <CertificateForm
              onAdded={handleCertificateAdded}
              onCancel={() => setShowCertForm(false)}
            />
          )}

          {certificates.length === 0 && !showCertForm && (
            <p className="profile-empty-text">No certificates added yet.</p>
          )}

          {certificates.map((cert) => (
            <div key={cert.id} className="profile-item">
              <div className="profile-item-icon">📜</div>
              <div className="profile-item-content">
                <div className="profile-item-title">{cert.name}</div>
                <div className="profile-item-subtitle">
                  {cert.issuing_organization}
                </div>
                <div className="profile-item-meta">
                  Issued {formatDate(cert.issue_date)}
                  {cert.expiry_date &&
                    ` · Expires ${formatDate(cert.expiry_date)}`}
                </div>
                {cert.credential_id && (
                  <div className="profile-item-meta">
                    Credential ID: {cert.credential_id}
                  </div>
                )}
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-item-link"
                  >
                    Show credential ↗
                  </a>
                )}
              </div>
              {isOwnProfile && (
                <button
                  className="profile-item-delete"
                  onClick={() => handleCertificateDeleted(cert.id)}
                  aria-label={`Delete ${cert.name} certificate`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ---------- PROJECTS (unchanged for now) ---------- */}
        <div className="profile-card profile-section">
          <div className="profile-section-header">
            <h2>Projects</h2>
            {isOwnProfile && (
              <button
                className="profile-add-btn"
                onClick={() => setShowProjectForm(!showProjectForm)}
              >
                {showProjectForm ? "✕" : "+"}
              </button>
            )}
          </div>

          {showProjectForm && (
            <ProjectForm
              onAdded={handleProjectAdded}
              onCancel={() => setShowProjectForm(false)}
            />
          )}

          {projects.length === 0 && !showProjectForm && (
            <p className="profile-empty-text">No projects added yet.</p>
          )}

          {projects.map((proj) => (
            <div key={proj.id} className="profile-item">
              <div className="profile-item-icon">🚀</div>
              <div className="profile-item-content">
                <div className="profile-item-title">{proj.title}</div>
                {(proj.start_date || proj.end_date) && (
                  <div className="profile-item-meta">
                    {formatDate(proj.start_date)} – {formatDate(proj.end_date)}
                  </div>
                )}
                {proj.description && (
                  <p className="profile-item-description">{proj.description}</p>
                )}
                {proj.tech_stack && (
                  <div className="project-tech-stack">
                    {proj.tech_stack.split(",").map((tech, i) => (
                      <span key={i} className="project-tech-badge">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
                <div className="project-links">
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-item-link"
                    >
                      💻 GitHub ↗
                    </a>
                  )}
                  {proj.live_url && (
                    <a
                      href={proj.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-item-link"
                    >
                      🔗 Live Demo ↗
                    </a>
                  )}
                </div>
              </div>
              {isOwnProfile && (
                <button
                  className="profile-item-delete"
                  onClick={() => handleProjectDeleted(proj.id)}
                  aria-label={`Delete ${proj.title} project`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <SkillsSection profileId={profile.id} isOwnProfile={isOwnProfile} />
      </div>

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSaved={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default Profile;
