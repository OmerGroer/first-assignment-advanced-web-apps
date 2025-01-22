import mongoose from "mongoose";
import { IPagingModel } from "../controllers/pagingController";

export interface IRestaurant extends IPagingModel {
  _id: string;
  name: string;
  category?: string;
  address: string;
  priceTypes: string;
  rating: number;
  ratingCount: number;
}

const restaurantSchema = new mongoose.Schema<IRestaurant>({
  _id: { type: String },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  priceTypes: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  ratingCount: {
    type: Number,
    required: true,
  },
  creationTime: {
    type: Date,
    required: true,
    default: Date.now
  }
});

restaurantSchema.index({ creationTime: -1 });

const restaurantModel = mongoose.model<IRestaurant>("Restaurants", restaurantSchema);

export default restaurantModel;