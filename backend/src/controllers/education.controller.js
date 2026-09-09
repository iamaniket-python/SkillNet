import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addEducation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { school, degree, fieldOfStudy, startDate, endDate } = req.body;

  const result = await pool.query(
    `INSERT INTO education (school, degree, field_of_study, start_date, end_date, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [school, degree, fieldOfStudy, startDate, endDate || null, userId]
  );

  res.status(201).json({ education: result.rows[0] });
});

export const updateEducation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { school, degree, fieldOfStudy, startDate, endDate } = req.body;

  const result = await pool.query(
    `UPDATE education
     SET school = COALESCE($1, school),
         degree = COALESCE($2, degree),
         field_of_study = COALESCE($3, field_of_study),
         start_date = COALESCE($4, start_date),
         end_date = $5
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [school, degree, fieldOfStudy, startDate, endDate || null, id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Education not found or not authorized" });
  }

  res.json({ education: result.rows[0] });
});

export const deleteEducation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await pool.query(
    "DELETE FROM education WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Education not found or not authorized" });
  }

  res.json({ message: "Education deleted" });
});