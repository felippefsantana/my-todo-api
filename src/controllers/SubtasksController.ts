import { Request, Response } from "express";
import { ZodError, z } from "zod";
import Subtask, { ISubtask } from "../models/Subtask";
import Task from "../models/Task";

type SubtaskData = Omit<ISubtask, "_id">;

export const createSubtask = async (req: Request, res: Response) => {
  const createSubtaskBody = z.object({
    title: z.string(),
    description: z.string().optional(),
  });

  try {
    const { title, description } = createSubtaskBody.parse(req.body);
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(400).json({
        message:
          "Não foi possível criar uma subtarefa, pois a tarefa não existe.",
      });
    }

    const subtaskData: SubtaskData = {
      title,
      description,
      task: task._id,
    };

    const subtaskDoc = new Subtask(subtaskData);
    const newSubtask = await subtaskDoc.save();

    task.subtasks?.push(newSubtask._id);
    await task.save();

    return res.status(201).json({
      message: "Subtarefa criada com sucesso!",
      data: newSubtask,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Dados inválidos", errors: error.errors });
    } else {
      return res
        .status(500)
        .json({ message: "Erro interno do servidor", error });
    }
  }
};
