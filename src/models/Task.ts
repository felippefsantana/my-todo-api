import { model, Schema, Types } from "mongoose";

export interface ITask {
  _id?: string;
  title: string;
  description?: string;
  completedAt: Date;
  owner: string | null;
}

const taskSchema: Schema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    completedAt: { type: Date, required: true },
    owner: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Task = model<ITask>("Task", taskSchema);

export default Task;
