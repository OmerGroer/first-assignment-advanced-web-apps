import mongoose, { Schema, Types } from "mongoose";

export interface IComments {
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
});

const commentsModel = mongoose.model<IComments>("Comments", commentsSchema);

export default commentsModel;