import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addExperience = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, company, location, startDate, endDate, description } = req.body;

  const result = await pool.query(
    `INSERT INTO experiences (title, company, location, start_date, end_date, description, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, company, location, startDate, endDate || null, description, userId]
  );

  res.status(201).json({ experience: result.rows[0] });
});

export const updateExperience = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, company, location, startDate, endDate, description } = req.body;

  const result = await pool.query(
    `UPDATE experiences
     SET title = COALESCE($1, title),
         company = COALESCE($2, company),
         location = COALESCE($3, location),
         start_date = COALESCE($4, start_date),
         end_date = $5,
         description = COALESCE($6, description)
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [title, company, location, startDate, endDate || null, description, id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Experience not found or not authorized" });
  }

  res.json({ experience: result.rows[0] });
});

export const deleteExperience = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await pool.query(
    "DELETE FROM experiences WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Experience not found or not authorized" });
  }

  res.json({ message: "Experience deleted" });
});