import express from "express";
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
} from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/conversations", getOrCreateConversation);
router.get("/conversations", getConversations);
router.get("/conversations/:id", getMessages);

export default router;