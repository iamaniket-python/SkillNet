import { asyncHandler } from "../utils/asyncHandler.js";
import pool from "../config/db.js";

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.status(201).json({ imageUrl: req.file.path });
});

export const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const userId = req.user.id;
  const imageUrl = req.file.path;

  const result = await pool.query(
    `UPDATE users SET profile_picture = $1, updated_at = NOW() 
     WHERE id = $2 RETURNING id, profile_picture`,
    [imageUrl, userId]
  );
  res.json({ user: result.rows[0] });
});

export const uploadBannerImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const userId = req.user.id;
  const imageUrl = req.file.path;

  const result = await pool.query(
    `UPDATE users SET banner_image = $1, updated_at = NOW() 
     WHERE id = $2 RETURNING id, banner_image`,
    [imageUrl, userId]
  );
  res.json({ user: result.rows[0] });
});