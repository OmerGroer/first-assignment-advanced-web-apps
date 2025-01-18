import mongoose from "mongoose";

export interface IPost {
  content: string;
  sender: string;
  restaurantId: string;
  restaurantName: string;
  restaurnatCategory: string | null;
  restaurnatAddress: string;
  rating: number;
}

const postSchema = new mongoose.Schema<IPost>({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  restaurantId: {
    type: String,
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
  restaurnatCategory: {
    type: String,
    required: false,
  },
  restaurnatAddress: {
    type: String,
    required: true,
  },
});

const postModel = mongoose.model<IPost>("Posts", postSchema);

export default postModel;