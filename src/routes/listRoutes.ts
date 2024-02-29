import express from "express";
import * as ListsController from "../controllers/ListsController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.get("/", auth, ListsController.findAllLists);
router.get("/:listId", auth, ListsController.findListById);
router.post("/create", auth, ListsController.createList);
router.patch("/update/:listId", auth, ListsController.updateList);
router.delete("/delete/:listId", auth, ListsController.deleteList);

export default router;
