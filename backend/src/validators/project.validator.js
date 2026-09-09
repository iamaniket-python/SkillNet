import { body } from "express-validator";

export const projectValidation = [
  body("title").trim().notEmpty().withMessage("Project title is required"),
  body("githubUrl")
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage("Invalid GitHub URL"),
  body("liveUrl")
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage("Invalid live URL"),
  body("startDate").optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage("Invalid start date"),
  body("endDate").optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage("Invalid end date"),
];