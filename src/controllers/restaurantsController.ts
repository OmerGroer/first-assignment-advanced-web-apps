import BaseController from "./baseController";
import restaurantModel, { IRestaurant } from "../models/restaurantsModel";

class RestaurantController extends BaseController<IRestaurant> {
  constructor() {
    super(restaurantModel);
  }
}

export default new RestaurantController();