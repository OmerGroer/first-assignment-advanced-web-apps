import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  _id?: string;
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
  }
});

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;