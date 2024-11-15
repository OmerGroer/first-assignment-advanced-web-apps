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
  console.log("create a post");
  res.send("create a post");
};

const updatePost = async (req, res) => {
  const postId = req.params.id;
  const postBody = req.body;

  try {
    const filter = { _id: postId };

    const post = await PostModel.findOneAndUpdate(filter, postBody, {
      new: true
    })

    if (post) {
      res.status(201).send(post);
    } else {
      res.status(404).send("Post not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  getAllPosts,
  createPost,
  updatePost,
  getPostById,
};