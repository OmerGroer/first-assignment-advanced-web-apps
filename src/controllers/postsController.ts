import postModel, { IPost } from "../models/postsModel";
import BaseController from "./baseController";

class PostsController extends BaseController<IPost> {
    constructor() {
      super(postModel);
    }

    getFilterFields() {
      return ["sender"];
    }

    getUpdateFields() {
      return ["title", "content"];
    }
  }

  export default new PostsController();