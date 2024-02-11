import { Request, Response } from "express";
import { ZodError, z } from "zod";
import Task, { ITask } from "../models/Task";
import { IRequestWithUser } from "../interfaces/IRequestWithUser";

type TaskData = Omit<ITask, "_id">;

export const createTask = async (req: Request, res: Response) => {
  const createTaskBody = z.object({
    title: z.string(),
    description: z.string(),
  });

  try {
    const { title, description } = createTaskBody.parse(req.body);

    const taskData: TaskData = {
      title,
      description,
      owner: (req as IRequestWithUser).user._id
    };

    const taskDoc = new Task(taskData);
    const newTask = await taskDoc.save();

    return res.status(201).json({
      message: "Tarefa criada com sucesso!",
      data: newTask,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Dados inválidos", errors: error.errors });
    } else {
      return res.status(500).json({ message: "Erro interno do servidor", error });
    }
  }
};
