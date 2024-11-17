const PostModel = require("../models/postsModel");

const getAllPosts = async (req, res) => {
  console.log("get all posts");
  res.send("get all posts");
};

const getPostById = async (req, res) => {
  console.log("get post by id");
  res.send("get post by id");
};

const createPost = async (req, res) => {
  const postBody = req.body;

  try {
    const post = await PostModel.create(postBody);

    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error.message);
  }
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