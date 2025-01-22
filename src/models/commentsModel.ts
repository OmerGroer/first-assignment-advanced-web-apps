import mongoose, { Schema, Types } from "mongoose";
import { IPagingModel } from "../controllers/pagingController";

export interface IComments extends IPagingModel {
  content: string;
  sender: Types.ObjectId;
  postId: Types.ObjectId;
}

const commentsSchema = new mongoose.Schema<IComments>({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  creationTime: {
    type: Date,
    required: true,
    default: Date.now
  }
});

commentsSchema.index({ creationTime: -1 });
commentsSchema.index({ postId: 1 });

const commentsModel = mongoose.model<IComments>("Comments", commentsSchema);

export default commentsModel;