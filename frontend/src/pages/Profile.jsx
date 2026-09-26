import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import EditProfileModal from "../components/EditProfileModal";
import ConfirmModal from "../components/ConfirmModal";
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

  const [editingExperience, setEditingExperience] = useState(null);
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  // generic delete-confirmation state: { type, id, label }
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  const handleExperienceSaved = (exp, isEditMode) => {
    if (isEditMode) {
      setExperiences((prev) => prev.map((e) => (e.id === exp.id ? exp : e)));
    } else {
      setExperiences((prev) => [exp, ...prev]);
    }
    setShowExpForm(false);
    setEditingExperience(null);
  };

  const handleEducationSaved = (edu, isEditMode) => {
    if (isEditMode) {
      setEducation((prev) => prev.map((e) => (e.id === edu.id ? edu : e)));
    } else {
      setEducation((prev) => [edu, ...prev]);
    }
    setShowEduForm(false);
    setEditingEducation(null);
  };

  const handleCertificateSaved = (cert, isEditMode) => {
    if (isEditMode) {
      setCertificates((prev) => prev.map((c) => (c.id === cert.id ? cert : c)));
    } else {
      setCertificates((prev) => [cert, ...prev]);
    }
    setShowCertForm(false);
    setEditingCertificate(null);
  };

  const handleProjectSaved = (project, isEditMode) => {
    if (isEditMode) {
      setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
    } else {
      setProjects((prev) => [project, ...prev]);
    }
    setShowProjectForm(false);
    setEditingProject(null);
  };

  // ---------- Custom delete confirmation flow (replaces window.confirm) ----------
  const requestDelete = (type, id, label) => {
    setConfirmDelete({ type, id, label });
  };

  const cancelDelete = () => setConfirmDelete(null);

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;

    try {
      if (type === "experience") {
        await api.delete(`/profile/experience/${id}`);
        setExperiences((prev) => prev.filter((e) => e.id !== id));
      } else if (type === "education") {
        await api.delete(`/profile/education/${id}`);
        setEducation((prev) => prev.filter((e) => e.id !== id));
      } else if (type === "certificate") {
        await api.delete(`/certificates/${id}`);
        setCertificates((prev) => prev.filter((c) => c.id !== id));
      } else if (type === "project") {
        await api.delete(`/projects/${id}`);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
      setError(`Couldn't delete this ${type}. Please try again.`);
    } finally {
      setConfirmDelete(null);
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

        {/* ---------- EXPERIENCE ---------- */}
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
                    onClick={() => requestDelete("experience", exp.id, exp.title)}
                    aria-label={`Delete ${exp.title} experience`}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ---------- EDUCATION ---------- */}
        <div className="profile-card profile-section">
          <div className="profile-section-header">
            <h2>Education</h2>
            {isOwnProfile && (
              <button
                className="profile-add-btn"
                onClick={() => {
                  setEditingEducation(null);
                  setShowEduForm(!showEduForm);
                }}
              >
                {showEduForm ? "✕" : "+"}
              </button>
            )}
          </div>

          {(showEduForm || editingEducation) && (
            <EducationForm
              education={editingEducation}
              onSaved={handleEducationSaved}
              onCancel={() => {
                setShowEduForm(false);
                setEditingEducation(null);
              }}
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
                <div className="profile-item-actions">
                  <button
                    className="profile-item-edit"
                    onClick={() => {
                      setShowEduForm(false);
                      setEditingEducation(edu);
                    }}
                    aria-label={`Edit ${edu.school} education entry`}
                  >
                    ✎
                  </button>
                  <button
                    className="profile-item-delete"
                    onClick={() => requestDelete("education", edu.id, edu.school)}
                    aria-label={`Delete ${edu.school} education entry`}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ---------- CERTIFICATES ---------- */}
        <div className="profile-card profile-section">
          <div className="profile-section-header">
            <h2>Licenses & Certificates</h2>
            {isOwnProfile && (
              <button
                className="profile-add-btn"
                onClick={() => {
                  setEditingCertificate(null);
                  setShowCertForm(!showCertForm);
                }}
              >
                {showCertForm ? "✕" : "+"}
              </button>
            )}
          </div>

          {(showCertForm || editingCertificate) && (
            <CertificateForm
              certificate={editingCertificate}
              onSaved={handleCertificateSaved}
              onCancel={() => {
                setShowCertForm(false);
                setEditingCertificate(null);
              }}
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
                {cert.credential_url ? (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-item-link"
                  >
                    Show credential ↗
                  </a>
                ) : null}
              </div>
              {isOwnProfile && (
                <div className="profile-item-actions">
                  <button
                    className="profile-item-edit"
                    onClick={() => {
                      setShowCertForm(false);
                      setEditingCertificate(cert);
                    }}
                    aria-label={`Edit ${cert.name} certificate`}
                  >
                    ✎
                  </button>
                  <button
                    className="profile-item-delete"
                    onClick={() => requestDelete("certificate", cert.id, cert.name)}
                    aria-label={`Delete ${cert.name} certificate`}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ---------- PROJECTS ---------- */}
        <div className="profile-card profile-section">
          <div className="profile-section-header">
            <h2>Projects</h2>
            {isOwnProfile && (
              <button
                className="profile-add-btn"
                onClick={() => {
                  setEditingProject(null);
                  setShowProjectForm(!showProjectForm);
                }}
              >
                {showProjectForm ? "✕" : "+"}
              </button>
            )}
          </div>

          {(showProjectForm || editingProject) && (
            <ProjectForm
              project={editingProject}
              onSaved={handleProjectSaved}
              onCancel={() => {
                setShowProjectForm(false);
                setEditingProject(null);
              }}
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
                  {proj.github_url ? (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-item-link"
                    >
                      💻 GitHub ↗
                    </a>
                  ) : null}
                  {proj.live_url ? (
                    <a
                      href={proj.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-item-link"
                    >
                      🔗 Live Demo ↗
                    </a>
                  ) : null}
                </div>
              </div>
              {isOwnProfile && (
                <div className="profile-item-actions">
                  <button
                    className="profile-item-edit"
                    onClick={() => {
                      setShowProjectForm(false);
                      setEditingProject(proj);
                    }}
                    aria-label={`Edit ${proj.title} project`}
                  >
                    ✎
                  </button>
                  <button
                    className="profile-item-delete"
                    onClick={() => requestDelete("project", proj.id, proj.title)}
                    aria-label={`Delete ${proj.title} project`}
                  >
                    ✕
                  </button>
                </div>
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

      {confirmDelete && (
        <ConfirmModal
          title="Delete this item?"
          message={`Are you sure you want to delete "${confirmDelete.label}"? This action cannot be undone.`}
          onConfirm={confirmDeleteAction}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default Profile;