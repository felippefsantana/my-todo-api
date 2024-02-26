import express from "express";
import * as ListsController from "../controllers/ListsController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.post("/create", auth, ListsController.createList);

export default router;
