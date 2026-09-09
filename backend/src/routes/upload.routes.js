import express from "express";
import {
  uploadImage,
  uploadProfilePicture,
  uploadBannerImage,
} from "../controllers/upload.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/image", upload.single("image"), uploadImage);
router.post("/profile-picture", upload.single("image"), uploadProfilePicture);
router.post("/banner", upload.single("image"), uploadBannerImage);

export default router;