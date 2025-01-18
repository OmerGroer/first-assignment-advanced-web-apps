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
      if (req.body.postId) {
        const post = await postModel.findById(req.body.postId);
        if (!post) {
          throw new Error("Post not found")
        }
      }

      req.body.sender = res.locals.userId;

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

  addUserRestirction(req: Request, res: Response): { [key: string]: any; } {
    return { sender: res.locals.userId };
  }

  getPopulatedFields() {
    return new Map<string, string>([
      ["sender", "username avatarUrl"],
    ]);
  }
}

export default new CommentsController();