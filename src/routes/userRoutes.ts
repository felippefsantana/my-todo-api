import express from "express";
import * as UsersController from "../controllers/UsersController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.post("/create", UsersController.createUser);
router.get("/me", auth, UsersController.findUser);
router.patch("/update", auth, UsersController.updateUser);
router.patch("/update-password", auth, UsersController.updatePassword);
router.delete("/delete", auth, UsersController.deleteUser);

export default router;
