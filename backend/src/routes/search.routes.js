import express from "express";
import {
  searchUsers,
  suggestedUsers,
  getSearchHistory,
  deleteSearchHistoryItem,
  clearSearchHistory,
} from "../controllers/search.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/users", searchUsers);
router.get("/suggested", suggestedUsers);
router.get("/history", getSearchHistory);
router.delete("/history/:query", deleteSearchHistoryItem);
router.delete("/history", clearSearchHistory);

export default router;