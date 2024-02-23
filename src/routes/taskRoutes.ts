import express from "express";
import * as TaskController from "../controllers/TasksController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.get("/", auth, TaskController.findAllTasks);
router.get("/:taskId", auth, TaskController.findTaskById);
router.post("/create", auth, TaskController.createTask);
router.patch("/update/:taskId", auth, TaskController.updateTask);
router.delete("/delete/:taskId", auth, TaskController.deleteTask);

export default router;