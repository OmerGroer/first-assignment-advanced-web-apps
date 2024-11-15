const PostModel = require("../models/postsModel");

const getAllPosts = async (req, res) => {
  console.log("get all posts");
  res.send("get all posts");
};

const getPostById = async (req, res) => {
  cconsole.log("get post by id");
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