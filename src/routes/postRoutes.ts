import express from "express";
const router = express.Router();
import postsController from "../controllers/postsController";
import { authMiddleware } from "../controllers/usersController";

router.use(authMiddleware);

router.get("/", postsController.getAll);
router.get("/:id", postsController.getById);
router.post("/", postsController.create);
router.put("/:id", postsController.update);
router.delete("/:id", postsController.delete);

export default router;