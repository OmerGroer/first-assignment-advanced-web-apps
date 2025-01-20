import mongoose, { Schema, Types } from "mongoose";

export interface ILikes {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
}
const likesSchema = new mongoose.Schema<ILikes>({
  userId: {
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

const likesModel = mongoose.model<ILikes>("Likes", likesSchema);

export default likesModel;