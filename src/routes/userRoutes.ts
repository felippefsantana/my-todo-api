import express from "express";
import * as UsersController from "../controllers/UsersController";

const router = express.Router();

router.post("/create", UsersController.create);

export default router;