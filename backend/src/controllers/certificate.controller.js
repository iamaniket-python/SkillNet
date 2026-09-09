import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addCertificate = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, issuingOrganization, issueDate, expiryDate, credentialId, credentialUrl } =
    req.body;

  const result = await pool.query(
    `INSERT INTO certificates 
       (name, issuing_organization, issue_date, expiry_date, credential_id, credential_url, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      name,
      issuingOrganization,
      issueDate,
      expiryDate || null,
      credentialId || null,
      credentialUrl || null,
      userId,
    ]
  );

  res.status(201).json({ certificate: result.rows[0] });
});

export const updateCertificate = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name, issuingOrganization, issueDate, expiryDate, credentialId, credentialUrl } =
    req.body;

  const result = await pool.query(
    `UPDATE certificates
     SET name = COALESCE($1, name),
         issuing_organization = COALESCE($2, issuing_organization),
         issue_date = COALESCE($3, issue_date),
         expiry_date = $4,
         credential_id = $5,
         credential_url = $6
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [
      name,
      issuingOrganization,
      issueDate,
      expiryDate || null,
      credentialId || null,
      credentialUrl || null,
      id,
      userId,
    ]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Certificate not found or not authorized" });
  }

  res.json({ certificate: result.rows[0] });
});

export const deleteCertificate = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await pool.query(
    "DELETE FROM certificates WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Certificate not found or not authorized" });
  }

  res.json({ message: "Certificate deleted" });
});