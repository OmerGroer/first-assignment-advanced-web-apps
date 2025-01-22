import restaurantModel, { IRestaurant } from "../models/restaurantsModel";
import PagingController from "./pagingController";

class RestaurantController extends PagingController<IRestaurant> {
  constructor() {
    super(restaurantModel);
  }
}

export default new RestaurantController();