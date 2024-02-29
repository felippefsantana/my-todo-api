import express from "express";
import * as UsersController from "../controllers/UsersController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.post("/create", UsersController.createUser);
router.get("/me", auth, UsersController.findUser);
router.patch("/update", auth, UsersController.updateUser);

export default router;
