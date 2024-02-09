import express from "express";
import * as TaskController from "../controllers/TasksController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.post("/create", auth, TaskController.create);

export default router;