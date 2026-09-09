import express from "express";
import {
  createPost,
  getFeed,
  getPost,
  deletePost,
  toggleLike,
  addComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from "../controllers/post.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createPostValidation, commentValidation } from "../validators/post.validator.js";

const router = express.Router();

router.use(protect);

router.post("/", createPostValidation, validate, createPost);
router.get("/feed", getFeed);
router.get("/:id", getPost);
router.delete("/:id", deletePost);
router.post("/:id/like", toggleLike);
router.post("/:id/comments", commentValidation, validate, addComment);
router.get("/:id/comments", getComments);
router.put("/comments/:commentId", commentValidation, validate, updateComment);
router.delete("/comments/:commentId", deleteComment);
router.post("/comments/:commentId/like", toggleCommentLike);

export default router;