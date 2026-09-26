import { useState } from "react";
import api from "../api/axios";

const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
};

const CertificateForm = ({ certificate, onSaved, onCancel }) => {
  const isEditMode = Boolean(certificate);

  const [formData, setFormData] = useState({
    name: certificate?.name || "",
    issuingOrganization: certificate?.issuing_organization || "",
    issueDate: toInputDate(certificate?.issue_date),
    expiryDate: toInputDate(certificate?.expiry_date),
    credentialId: certificate?.credential_id || "",
    credentialUrl: certificate?.credential_url || "",
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
        expiryDate: formData.expiryDate || null,
      };

      const res = isEditMode
        ? await api.put(`/certificates/${certificate.id}`, payload)
        : await api.post("/certificates", payload);

      onSaved(res.data.certificate, isEditMode);
    } catch (err) {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);
      setError(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Failed to save certificate"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}

      <div className="form-group">
        <label>Certificate name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. AWS Certified Solutions Architect"
          required
        />
      </div>
      <div className="form-group">
        <label>Issuing organization</label>
        <input
          name="issuingOrganization"
          value={formData.issuingOrganization}
          onChange={handleChange}
          placeholder="e.g. Amazon Web Services"
          required
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Issue date</label>
          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Expiry date (optional)</label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Credential ID (optional)</label>
        <input
          name="credentialId"
          value={formData.credentialId}
          onChange={handleChange}
          placeholder="e.g. ABC-123456"
        />
      </div>
      <div className="form-group">
        <label>Credential URL (optional)</label>
        <input
          name="credentialUrl"
          value={formData.credentialUrl}
          onChange={handleChange}
          placeholder="https://..."
        />
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

export default CertificateForm;