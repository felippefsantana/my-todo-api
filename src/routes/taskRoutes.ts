import express from "express";
import * as TasksController from "../controllers/TasksController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.get("/", auth, TasksController.findAllTasks);
router.get("/:taskId", auth, TasksController.findTaskById);
router.post("/create", auth, TasksController.createTask);
router.patch("/update/:taskId", auth, TasksController.updateTask);
router.delete("/delete/:taskId", auth, TasksController.deleteTask);

export default router;