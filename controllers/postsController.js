const PostModel = require("../models/postsModel");

const getAllPosts = async (req, res) => {
  console.log("get all posts");
  res.send("get all posts");
};

const getPostById = async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await PostModel.findById(postId);
    if (post) {
      res.send(post);
    } else {
      res.status(404).send("Post not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const createPost = async (req, res) => {
  console.log("create a post");
  res.send("create a post");
};

const updatePost = (req, res) => {
  console.log("delete a post");
  res.send("delete a post");
};

module.exports = {
  getAllPosts,
  createPost,
  updatePost,
  getPostById,
};