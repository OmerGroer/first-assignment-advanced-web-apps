import mongoose from "mongoose";
import { IPagingModel } from "../controllers/pagingController";

export interface IUser extends IPagingModel {
  username: string;
  email: string;
  password: string;
  avatarUrl: string;
  _id?: string;
  refreshToken?: string[];
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: [String],
    default: [],
  },
  creationTime: {
    type: Date,
    required: true,
    default: Date.now
  }
});

userSchema.index({ creationTime: -1 });

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;