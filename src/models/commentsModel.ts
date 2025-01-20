import mongoose, { Schema, Types } from "mongoose";

export interface IComments {
  content: string;
  sender: Types.ObjectId;
  postId: string;
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
    type: String,
    required: true,
  },
});

const commentsModel = mongoose.model<IComments>("Comments", commentsSchema);

export default commentsModel;