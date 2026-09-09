import { body } from "express-validator";

export const certificateValidation = [
  body("name").trim().notEmpty().withMessage("Certificate name is required"),
  body("issuingOrganization").trim().notEmpty().withMessage("Issuing organization is required"),
  body("issueDate").isISO8601().withMessage("Valid issue date is required"),
  body("expiryDate").optional({ nullable: true }).isISO8601().withMessage("Invalid expiry date"),
  body("credentialUrl")
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage("Invalid credential URL"),
];