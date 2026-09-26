import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addSkill = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  const existing = await pool.query(
    "SELECT id FROM skills WHERE user_id = $1 AND LOWER(name) = LOWER($2)",
    [userId, name]
  );

  if (existing.rows.length > 0) {
    return res.status(400).json({ message: "Skill already added" });
  }

  const result = await pool.query(
    `INSERT INTO skills (name, user_id) VALUES ($1, $2) RETURNING *`,
    [name.trim(), userId]
  );

  res.status(201).json({ skill: { ...result.rows[0], endorsement_count: 0, endorsed_by_me: false } });
});

export const deleteSkill = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await pool.query(
    "DELETE FROM skills WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Skill not found or not authorized" });
  }

  res.json({ message: "Skill deleted" });
});

export const updateSkill = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name } = req.body;

  // duplicate check (same user, same name, excluding current skill)
  const existing = await pool.query(
    "SELECT id FROM skills WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND id != $3",
    [userId, name, id]
  );

  if (existing.rows.length > 0) {
    return res.status(400).json({ message: "Skill already exists" });
  }

  const result = await pool.query(
    `UPDATE skills SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
    [name.trim(), id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Skill not found or not authorized" });
  }

  res.json({ skill: result.rows[0] });
});

export const getSkills = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  const result = await pool.query(
    `SELECT s.*, 
       COUNT(DISTINCT se.id) AS endorsement_count,
       EXISTS(SELECT 1 FROM skill_endorsements WHERE skill_id = s.id AND endorser_id = $2) AS endorsed_by_me
     FROM skills s
     LEFT JOIN skill_endorsements se ON se.skill_id = s.id
     WHERE s.user_id = $1
     GROUP BY s.id
     ORDER BY endorsement_count DESC, s.created_at DESC`,
    [id, currentUserId]
  );

  res.json({ skills: result.rows });
});

export const toggleEndorsement = asyncHandler(async (req, res) => {
  const { id: skillId } = req.params;
  const endorserId = req.user.id;

  const skill = await pool.query("SELECT user_id FROM skills WHERE id = $1", [skillId]);
  if (skill.rows.length === 0) {
    return res.status(404).json({ message: "Skill not found" });
  }
  if (skill.rows[0].user_id === endorserId) {
    return res.status(400).json({ message: "Cannot endorse your own skill" });
  }

  const existing = await pool.query(
    "SELECT id FROM skill_endorsements WHERE skill_id = $1 AND endorser_id = $2",
    [skillId, endorserId]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      "DELETE FROM skill_endorsements WHERE skill_id = $1 AND endorser_id = $2",
      [skillId, endorserId]
    );
    return res.json({ endorsed: false });
  }

  await pool.query(
    "INSERT INTO skill_endorsements (skill_id, endorser_id) VALUES ($1, $2)",
    [skillId, endorserId]
  );

  res.json({ endorsed: true });
});