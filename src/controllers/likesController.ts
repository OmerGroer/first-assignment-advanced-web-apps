import BaseController from "./baseController";
import likesModel, { ILikes } from "../models/likesModel";
import { Request, Response } from "express";
import postModel from "../models/postsModel";

class LikeController extends BaseController<ILikes> {
  constructor() {
    super(likesModel);
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

      req.body.userId = res.locals.userId;

      await super.create(req, res);
    } catch (error) {
      res.status(400).send((error as Error).message);
    }
  }

  async delete(req: Request, res: Response) {
    const postId = req.params.postId;
    try {
      const filter = { postId, userId: res.locals.userId };
      const item = await this.model.findOneAndDelete(filter);

      if (item) {
        res.status(200).send(item);
      } else {
        res.status(404).send("not found");
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }
}

export default new LikeController();
