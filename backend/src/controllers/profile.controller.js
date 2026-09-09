import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get any user's public profile (with experience + education)
export const getProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  const userResult = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.headline, u.location, 
            u.profile_picture, u.banner_image, u.about, u.created_at,
            c.status AS connection_status, c.id AS connection_id, c.requester_id
     FROM users u
     LEFT JOIN connections c 
       ON (c.requester_id = $2 AND c.receiver_id = u.id) 
       OR (c.receiver_id = $2 AND c.requester_id = u.id)
     WHERE u.id = $1`,
    [id, currentUserId],
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  // log profile view (sirf tab jab khud ka profile na ho)
  if (parseInt(id) !== currentUserId) {
    await pool.query(
      `INSERT INTO profile_views (viewer_id, profile_id) VALUES ($1, $2)`,
      [currentUserId, id],
    );
  }

  const experiences = await pool.query(
    `SELECT * FROM experiences WHERE user_id = $1 ORDER BY start_date DESC`,
    [id],
  );
  const certificates = await pool.query(
    `SELECT * FROM certificates WHERE user_id = $1 ORDER BY issue_date DESC`,
    [id],
  );
  const projects = await pool.query(
    `SELECT * FROM projects WHERE user_id = $1 ORDER BY start_date DESC NULLS LAST, created_at DESC`,
    [id],
  );
  const education = await pool.query(
    `SELECT * FROM education WHERE user_id = $1 ORDER BY start_date DESC`,
    [id],
  );

  res.json({
    user: userResult.rows[0],
    experiences: experiences.rows,
    education: education.rows,
    certificates: certificates.rows,
    projects: projects.rows,
  });
});
// Update own profile
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { headline, location, about, profilePicture, bannerImage } = req.body;

  const result = await pool.query(
    `UPDATE users 
     SET headline = COALESCE($1, headline),
         location = COALESCE($2, location),
         about = COALESCE($3, about),
         profile_picture = COALESCE($4, profile_picture),
         banner_image = COALESCE($5, banner_image),
         updated_at = NOW()
     WHERE id = $6
     RETURNING id, first_name, last_name, email, headline, location, about, profile_picture, banner_image`,
    [headline, location, about, profilePicture, bannerImage, userId],
  );

  res.json({ user: result.rows[0] });
});
