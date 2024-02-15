import express from "express";
import * as SubtaskController from "../controllers/SubtaskController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.post("/create", auth, SubtaskController.createSubtask);

export default router;