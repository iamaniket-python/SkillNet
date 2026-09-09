import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // pichle 90 din ke profile views
  const viewCountResult = await pool.query(
    `SELECT COUNT(*) FROM profile_views 
     WHERE profile_id = $1 AND created_at > NOW() - INTERVAL '90 days'`,
    [userId]
  );

  // recent viewers (unique, last 20)
  const recentViewersResult = await pool.query(
    `SELECT DISTINCT ON (pv.viewer_id) 
       u.id, u.first_name, u.last_name, u.headline, u.profile_picture, pv.created_at
     FROM profile_views pv
     JOIN users u ON u.id = pv.viewer_id
     WHERE pv.profile_id = $1
     ORDER BY pv.viewer_id, pv.created_at DESC
     LIMIT 20`,
    [userId]
  );

  // sort recent viewers by most recent view
  const sortedViewers = recentViewersResult.rows.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // search appearances (pichle 7 din)
  const searchAppearanceResult = await pool.query(
    `SELECT COUNT(*) FROM search_appearances 
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'`,
    [userId]
  );

  res.json({
    profileViews: parseInt(viewCountResult.rows[0].count),
    recentViewers: sortedViewers,
    searchAppearances: parseInt(searchAppearanceResult.rows[0].count),
  });
});