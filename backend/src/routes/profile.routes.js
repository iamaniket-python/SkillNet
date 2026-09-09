import express from "express";
import { getProfile, updateProfile } from "../controllers/profile.controller.js";
import {
  addExperience,
  updateExperience,
  deleteExperience,
} from "../controllers/experience.controller.js";
import {
  addEducation,
  updateEducation,
  deleteEducation,
} from "../controllers/education.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { experienceValidation, educationValidation } from "../validators/profile.validator.js";

const router = express.Router();

router.get("/:id", protect, getProfile);
router.put("/", protect, updateProfile);

router.post("/experience", protect, experienceValidation, validate, addExperience);
router.put("/experience/:id", protect, experienceValidation, validate, updateExperience);
router.delete("/experience/:id", protect, deleteExperience);

router.post("/education", protect, educationValidation, validate, addEducation);
router.put("/education/:id", protect, educationValidation, validate, updateEducation);
router.delete("/education/:id", protect, deleteEducation);

export default router;