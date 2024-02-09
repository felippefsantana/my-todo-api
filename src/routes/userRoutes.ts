import express from "express";
import * as UsersController from "../controllers/UsersController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.post("/create", UsersController.create);
router.patch("/update/:userId", auth, UsersController.update);

export default router;