import { model, Schema } from "mongoose";
import { ObjectId } from "mongodb";
import List from "./List";
import Task from "./Task";

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

userSchema.pre<IUser>(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const userId = this._id;
    await Task.deleteMany({ owner: userId });
    await List.deleteMany({ owner: userId });
    next();
  }
);

const User = model<IUser>("User", userSchema);

export default User;
