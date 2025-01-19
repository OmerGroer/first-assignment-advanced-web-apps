import { Request, Response } from "express";
import BaseController from "./baseController";
import postModel from "../models/postsModel";
import restaurantModel, { IRestaurant } from "../models/restaurantsModel";

class RestaurantController extends BaseController<IRestaurant> {
  constructor() {
    super(restaurantModel);
  }
}

export default new RestaurantController();