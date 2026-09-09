import express from "express";
import { getUserPosts, getActivitySummary } from "../controllers/activity.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/:id/posts", getUserPosts);
router.get("/:id/summary", getActivitySummary);

export default router;