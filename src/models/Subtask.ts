import { model, Schema, Types } from "mongoose";

export interface ISubtask {
  _id?: string;
  title: string;
  description?: string;
  completedAt: Date;
  task: string | null;
}

const subtaskSchema: Schema = new Schema<ISubtask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    completedAt: { type: Date, required: true },
    task: { type: Types.ObjectId, ref: "Task", required: true },
  },
  { timestamps: true }
);

const Subtask = model<ISubtask>("Subtask", subtaskSchema);

export default Subtask;
