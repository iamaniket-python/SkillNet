import express from "express";
import { addProject, updateProject, deleteProject } from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { projectValidation } from "../validators/project.validator.js";

const router = express.Router();

router.use(protect);

router.post("/", projectValidation, validate, addProject);
router.put("/:id", projectValidation, validate, updateProject);
router.delete("/:id", deleteProject);

export default router;