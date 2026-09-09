import { body } from "express-validator";

export const createPostValidation = [
  body("content").trim().notEmpty().withMessage("Content is required")
    .isLength({ max: 3000 }).withMessage("Content too long"),
];

export const commentValidation = [
  body("content").trim().notEmpty().withMessage("Comment cannot be empty")
    .isLength({ max: 1000 }).withMessage("Comment too long"),
];