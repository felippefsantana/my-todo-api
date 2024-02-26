import { model, Schema } from "mongoose";
import { ObjectId } from "mongodb";
import Task from "./Task";

export interface IList {
  _id: ObjectId;
  title: string;
  owner: ObjectId;
  tasks: ObjectId[];
}

const listSchema: Schema = new Schema<IList>(
  {
    title: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task", required: false }],
  },
  { timestamps: true }
);

listSchema.pre<IList>(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const listId = this._id;
    await Task.deleteMany({ list: listId });
    next();
  }
);

const List = model<IList>("List", listSchema);

export default List;
