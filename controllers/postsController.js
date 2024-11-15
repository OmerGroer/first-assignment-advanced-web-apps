const PostModel = require("../models/postsModel");

const getAllPosts = async (req, res) => {
  const sender = req.query.sender;
  
  try {
    const filter = {}
    if (sender) filter.sender = sender

    const posts = await PostModel.find(filter);
    res.send(posts);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getPostById = async (req, res) => {
  console.log("get post by id");
  res.send("get post by id");
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