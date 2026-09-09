import { body } from "express-validator";

export const sendRequestValidation = [
  body("userId").isInt().withMessage("Valid userId is required"),
];

export const respondValidation = [
  body("action").isIn(["accept", "reject"]).withMessage("Action must be accept or reject"),
];