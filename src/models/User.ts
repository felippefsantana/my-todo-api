import { model, Schema } from "mongoose";
import { ObjectId } from "mongodb";

export interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
}

const userSchema: Schema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = model<IUser>("User", userSchema);

export default User;
