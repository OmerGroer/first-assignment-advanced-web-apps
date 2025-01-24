import commentsModel, { IComments } from "../models/commentsModel";
import { Request, Response } from "express";
import postModel from "../models/postsModel";
import PagingController from "./pagingController";

class CommentsController extends PagingController<IComments> {
  constructor() {
    super(commentsModel);
  }

  async create(req: Request, res: Response) {
    try {
      if (req.body.postId) {
        const post = await postModel.findById(req.body.postId);
        if (!post) {
          throw new Error("Post not found");
        }
      } else {
        throw new Error("Post not found");
      }

      req.body.sender = res.locals.userId;

      await super.create(req, res);
    } catch (error) {
      res.status(400).send((error as Error).message);
    }
  }

  getFilterFields() {
    return [...super.getFilterFields(), "sender", "postId"];
  }

  getUpdateFields() {
    return ["content"];
  }

  addUserRestirction(req: Request, res: Response): { [key: string]: any } {
    return { sender: res.locals.userId };
  }

  getPopulatedFields() {
    return new Map<string, string>([["sender", "username avatarUrl"]]);
  }

  getLimit(): number {
    return Infinity;
  }
}

export default new CommentsController();
