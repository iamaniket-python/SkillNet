import express from "express";
import { addSkill, deleteSkill, getSkills, toggleEndorsement } from "../controllers/skill.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { skillValidation } from "../validators/skill.validator.js";

const router = express.Router();

router.use(protect);

router.post("/", skillValidation, validate, addSkill);
router.delete("/:id", deleteSkill);
router.get("/user/:id", getSkills);
router.post("/:id/endorse", toggleEndorsement);

export default router;