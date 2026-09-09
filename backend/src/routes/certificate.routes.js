import express from "express";
import {
  addCertificate,
  updateCertificate,
  deleteCertificate,
} from "../controllers/certificate.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { certificateValidation } from "../validators/certificate.validator.js";

const router = express.Router();

router.use(protect);

router.post("/", certificateValidation, validate, addCertificate);
router.put("/:id", certificateValidation, validate, updateCertificate);
router.delete("/:id", deleteCertificate);

export default router;