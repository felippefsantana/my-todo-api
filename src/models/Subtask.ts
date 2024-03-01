import { model, Schema } from "mongoose";
import { ObjectId } from "mongodb";

export interface ISubtask {
  _id: ObjectId;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: Date;
  task: ObjectId;
}

const subtaskSchema: Schema = new Schema<ISubtask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    isCompleted: { type: Boolean, required: true, default: false },
    completedAt: { type: Date, required: false },
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  },
  { timestamps: true }
);

const Subtask = model<ISubtask>("Subtask", subtaskSchema);

export default Subtask;
