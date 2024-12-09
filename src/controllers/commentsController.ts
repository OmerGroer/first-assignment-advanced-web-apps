import commentsModel, { IComments } from "../models/commentsModel";
import { Request, Response } from "express";
import BaseController from "./baseController";
import postModel from "../models/postsModel";

class CommentsController extends BaseController<IComments> {
  constructor() {
    super(commentsModel);
  }

  async create(req: Request, res: Response) {
    try {
      const post = await postModel.findById(req.body.postId);
      if (!post) {
        res.status(400).send("Post not found");
      }

      await super.create(req, res);
    } catch (error) {
      res.status(400).send(error);
    }
  }

  getFilterFields() {
    return ["sender", "postId"];
  }

  getUpdateFields() {
    return ["content"];
  }
}

export default new CommentsController();