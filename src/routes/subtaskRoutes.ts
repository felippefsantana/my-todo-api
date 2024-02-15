import express from "express";
import * as SubtaskController from "../controllers/SubtasksController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.post("/create/:taskId", auth, SubtaskController.createSubtask);

export default router;