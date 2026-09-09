import { body } from "express-validator";

export const skillValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Skill name is required")
    .isLength({ max: 100 })
    .withMessage("Skill name too long"),
];