import postModel, { IPost } from "../models/postsModel";
import BaseController from "./baseController";
import { Request, Response } from "express";

class PostsController extends BaseController<IPost> {
    constructor() {
      super(postModel);
    }

    async create(req: Request, res: Response) {
      try { 
        req.body.sender = res.locals.userId;
  
        await super.create(req, res);
      } catch (error) {
        res.status(400).send((error as Error).message);
      }
    }

    getFilterFields() {
      return ["sender", "restaurantId"];
    }

    getUpdateFields() {
      return ["rating", "content"];
    }
  }

  export default new PostsController();