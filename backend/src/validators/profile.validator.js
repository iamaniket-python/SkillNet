import { body } from "express-validator";

export const experienceValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("company").trim().notEmpty().withMessage("Company is required"),
  body("startDate").isISO8601().withMessage("Valid start date is required"),
  body("endDate").optional({ nullable: true }).isISO8601().withMessage("Invalid end date"),
];

export const educationValidation = [
  body("school").trim().notEmpty().withMessage("School is required"),
  body("startDate").isISO8601().withMessage("Valid start date is required"),
  body("endDate").optional({ nullable: true }).isISO8601().withMessage("Invalid end date"),
];