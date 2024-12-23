import commentsModel, { IComments } from "../models/commentsModel";
import { Request, Response } from "express";
import BaseController from "./baseController";
import postModel from "../models/postsModel";
import userModel from "../models/usersModel";

class CommentsController extends BaseController<IComments> {
  constructor() {
    super(commentsModel);
  }

  async create(req: Request, res: Response) {
    try {
      if (req.body.postId) {
        const post = await postModel.findById(req.body.postId);
        if (!post) {
          throw new Error("Post not found")
        }
      }

      if (req.body.sender) {
        const user = await userModel.findById(req.body.sender);
        if (!user) {
          throw new Error("Sender not found")
        }
      }

      await super.create(req, res);
    } catch (error) {
      res.status(400).send((error as Error).message);
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