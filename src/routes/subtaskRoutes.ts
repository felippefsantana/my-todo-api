import express from "express";
import * as SubtasksController from "../controllers/SubtasksController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.post("/create/:taskId", auth, SubtasksController.createSubtask);
router.patch("/update/:subtaskId", auth, SubtasksController.updateSubtask);
router.patch("/complete/:subtaskId", auth, SubtasksController.completeSubtask);
router.delete("/delete/:subtaskId", auth, SubtasksController.deleteSubtask);

export default router;