import { model, Schema } from "mongoose";
import { ObjectId } from "mongodb";
import Subtask from "./Subtask";

export interface ITask {
  _id: ObjectId;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: Date;
  owner: ObjectId;
  list?: ObjectId;
  subtasks: ObjectId[];
}

const taskSchema: Schema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    isCompleted: { type: Boolean, required: true, default: false },
    completedAt: { type: Date, required: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    list: { type: Schema.Types.ObjectId, ref: "List", required: false },
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

taskSchema.pre("deleteMany", async function (next) {
  const listId = this.getQuery().list;
  const tasksFromList = await Task.find({ list: listId });
  await Subtask.deleteMany({
    task: { $in: tasksFromList },
  });

  const userId = this.getQuery().owner;
  const tasksFromUser = await Task.find({ owner: userId });
  await Subtask.deleteMany({
    task: { $in: tasksFromUser },
  });

  next();
});

const Task = model<ITask>("Task", taskSchema);

export default Task;
