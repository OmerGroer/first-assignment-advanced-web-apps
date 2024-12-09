import mongoose from "mongoose";

export interface IComments {
  content: string;
  sender: string;
  postId: string;
}
const commentsSchema = new mongoose.Schema<IComments>({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
});

const commentsModel = mongoose.model<IComments>("Comments", commentsSchema);

export default commentsModel;