import { model, ObjectId, Schema } from "mongoose";

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  completedAt?: Date;
  owner: ObjectId;
}

const taskSchema: Schema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    completedAt: { type: Date, required: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Task = model<ITask>("Task", taskSchema);

export default Task;
