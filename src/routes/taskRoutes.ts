import express from "express";
import * as TaskController from "../controllers/TasksController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.get("/", auth, TaskController.getAllTasks);
router.post("/create", auth, TaskController.createTask);

export default router;