import mongoose, { Schema } from "mongoose";

export interface IComments {
  content: string;
  sender: Schema.Types.ObjectId;
  postId: Schema.Types.ObjectId;
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
    ref: "Posts",
    required: true,
  },
});

const commentsModel = mongoose.model<IComments>("Comments", commentsSchema);

export default commentsModel;