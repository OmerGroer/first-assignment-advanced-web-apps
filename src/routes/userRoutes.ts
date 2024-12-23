import express from "express";
const router = express.Router();
import usersController, { authMiddleware } from "../controllers/usersController";

router.use(authMiddleware);

router.get("/", usersController.getAll);
router.get("/:id", usersController.getById);
router.put("/:id", usersController.update);
router.delete("/:id", usersController.delete);

export default router;