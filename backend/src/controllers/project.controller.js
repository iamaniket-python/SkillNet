import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addProject = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, description, techStack, githubUrl, liveUrl, startDate, endDate } = req.body;

  const result = await pool.query(
    `INSERT INTO projects 
       (title, description, tech_stack, github_url, live_url, start_date, end_date, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      title,
      description || null,
      techStack || null,
      githubUrl || null,
      liveUrl || null,
      startDate || null,
      endDate || null,
      userId,
    ]
  );

  res.status(201).json({ project: result.rows[0] });
});

export const updateProject = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, description, techStack, githubUrl, liveUrl, startDate, endDate } = req.body;

  const result = await pool.query(
    `UPDATE projects
     SET title = COALESCE($1, title),
         description = $2,
         tech_stack = $3,
         github_url = $4,
         live_url = $5,
         start_date = $6,
         end_date = $7
     WHERE id = $8 AND user_id = $9
     RETURNING *`,
    [
      title,
      description || null,
      techStack || null,
      githubUrl || null,
      liveUrl || null,
      startDate || null,
      endDate || null,
      id,
      userId,
    ]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Project not found or not authorized" });
  }

  res.json({ project: result.rows[0] });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await pool.query(
    "DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Project not found or not authorized" });
  }

  res.json({ message: "Project deleted" });
});