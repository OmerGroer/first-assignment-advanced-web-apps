import express from "express";
const router = express.Router();
import commentsController from "../controllers/commentsController";

router.get("/", commentsController.getAll);

router.get("/:id", commentsController.getById);

router.post("/", commentsController.create);

router.put('/:id', commentsController.update);

router.delete("/:id", commentsController.delete);

export default router;