import restaurantModel, { IRestaurant } from "../models/restaurantsModel";
import PagingController from "./pagingController";

class RestaurantController extends PagingController<IRestaurant> {
  constructor() {
    super(restaurantModel);
  }

  getLimit(): number {
    return Number(process.env.LIMIT_DOCUMENTS_RESTAURANT);
  }

  getLikeFields(): string[] {
    return ["name", "category", "address"]
  }
}

export default new RestaurantController();