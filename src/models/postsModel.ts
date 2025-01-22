import mongoose, { Schema, Types } from "mongoose";
import { IPagingModel } from "../controllers/pagingController";

export interface IPost extends IPagingModel {
  content: string;
  sender: Types.ObjectId;
  imageUrl: string;
  restaurant: string;
  rating: number;
}

const postSchema = new mongoose.Schema<IPost>({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    validate: {
      validator: (v: number) => v > 0 && v <= 5,
      message: "Rating must be between 1 and 5",
    },
  },
  restaurant: {
    type: String,
    ref: "Restaurants",
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  creationTime: {
    type: Date,
    required: true,
    default: Date.now
  }
});

postSchema.index({ creationTime: -1 });

const postModel = mongoose.model<IPost>("Posts", postSchema);

export default postModel;