import { Request, Response } from "express";
import { ZodError, z } from "zod";
import Task, { ITask } from "../models/Task";
import { IRequestWithUser } from "../interfaces/IRequestWithUser";

type TaskData = Omit<ITask, "_id">;

export const createTask = async (req: Request, res: Response) => {
  const createTaskBody = z.object({
    title: z.string(),
    description: z.string().optional(),
  });

  try {
    const { title, description } = createTaskBody.parse(req.body);

    const taskData: TaskData = {
      title,
      description,
      owner: (req as IRequestWithUser).user._id,
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
    }

    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const findAllTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as IRequestWithUser).user._id;
    const tasks = await Task.find({ owner: userId });
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const findTaskById = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = (req as IRequestWithUser).user._id;
    const task = await Task.findOne({ _id: taskId, owner: userId }).populate("subtasks");
    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const updateTaskBody = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  });

  try {
    const { title, description } = updateTaskBody.parse(req.body);
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(400).json({ message: "Tarefa inexistente!" });
    }

    await task.updateOne({ title, description });
    return res.status(200).json({ message: "Tarefa atualizada com sucesso!" });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Dados inválidos", errors: error.errors });
    }

    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(400).json({ message: "Tarefa inexistente!" });
    }

    await task.deleteOne();
    return res.status(200).json({ message: "Tarefa excluída com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};
