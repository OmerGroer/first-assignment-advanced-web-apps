import express from "express";
const router = express.Router();
import usersController from "../controllers/usersController";

router.post("/register", usersController.create);
router.post("/login", usersController.login);
router.post("/refresh", usersController.refresh);
router.post("/logout", usersController.logout);

export default router;