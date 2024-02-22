import { model, Schema } from "mongoose";
import { ObjectId } from "mongodb";
import Subtask from "./Subtask";

export interface ITask {
  _id: ObjectId;
  title: string;
  description?: string;
  completedAt?: Date;
  owner: ObjectId;
  subtasks?: ObjectId[];
}

const taskSchema: Schema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    completedAt: { type: Date, required: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subtasks: [
      { type: Schema.Types.ObjectId, ref: "Subtask", required: false },
    ],
  },
  { timestamps: true }
);

taskSchema.pre<ITask>(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const taskId = this._id;
    await Subtask.deleteMany({ task: taskId });
    next();
  }
);

const Task = model<ITask>("Task", taskSchema);

export default Task;
