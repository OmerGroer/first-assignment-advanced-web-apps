const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");

router.get("/", postsController.getAllPosts);

router.get("/:id", postsController.getPostById);

router.post("/", postsController.createPost);

router.put("/", postsController.updatePost);

module.exports = router;