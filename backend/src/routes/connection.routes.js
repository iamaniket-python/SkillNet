import express from "express";
import {
  sendRequest,
  respondToRequest,
  removeConnection,
  getConnections,
  getPendingRequests,
} from "../controllers/connection.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { sendRequestValidation, respondValidation } from "../validators/connection.validator.js";

const router = express.Router();

router.use(protect);

router.post("/request", sendRequestValidation, validate, sendRequest);
router.patch("/:id/respond", respondValidation, validate, respondToRequest);
router.delete("/:id", removeConnection);
router.get("/", getConnections);
router.get("/pending", getPendingRequests);

export default router;