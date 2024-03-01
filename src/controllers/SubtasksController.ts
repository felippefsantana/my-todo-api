import { Request, Response } from "express";
import { ZodError, z } from "zod";
import Subtask, { ISubtask } from "../models/Subtask";
import Task from "../models/Task";
import { IRequestWithUser } from "../interfaces/IRequestWithUser";

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
      isCompleted: false,
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
    }

    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const updateSubtask = async (req: Request, res: Response) => {
  const updateSubtaskBody = z.object({
    title: z.string(),
    description: z.string().optional(),
    isCompleted: z.boolean().optional(),
  });

  try {
    const { title, description, isCompleted } = updateSubtaskBody.parse(req.body);
    const { subtaskId } = req.params;
    const userId = (req as IRequestWithUser).user._id;
    const subtask = await Subtask.findById(subtaskId);

    if (subtask) {
      const task = await Task.findById(subtask.task);

      if (task!.owner.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Subtarefa inexistente!" });
      }
    } else {
      return res.status(400).json({ message: "Subtarefa inexistente!" });
    }

    subtask.title = title;
    subtask.description = description;
    subtask.isCompleted = !!isCompleted;
    subtask.completedAt = isCompleted ? new Date() : undefined;
    await subtask.save();

    return res
      .status(200)
      .json({ message: "Subtarefa atualizada com sucesso!" });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Dados inválidos", errors: error.errors });
    }

    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const completeSubtask = async (req: Request, res: Response) => {
  const updateStatusBody = z.object({
    isCompleted: z.boolean(),
  });

  try {
    const { isCompleted } = updateStatusBody.parse(req.body);
    const { subtaskId } = req.params;
    const userId = (req as IRequestWithUser).user._id;
    const subtask = await Subtask.findById(subtaskId);

    if (subtask) {
      const task = await Task.findById(subtask.task);

      if (task!.owner.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Subtarefa inexistente!" });
      }
    } else {
      return res.status(400).json({ message: "Subtarefa inexistente!" });
    }

    subtask.isCompleted = isCompleted;
    subtask.completedAt = isCompleted ? new Date() : undefined;
    await subtask.save();

    return res.status(200).json({ message: "Subtarefa atualizada com sucesso!" });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Dados inválidos", errors: error.errors });
    }

    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const deleteSubtask = async (req: Request, res: Response) => {
  try {
    const { subtaskId } = req.params;
    const userId = (req as IRequestWithUser).user._id;
    const subtask = await Subtask.findById(subtaskId);
    let task = undefined;

    if (subtask) {
      const taskId = subtask.task;
      task = await Task.findById(taskId);

      if (task!.owner.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Subtarefa inexistente!" });
      }
    } else {
      return res.status(400).json({ message: "Subtarefa inexistente!" });
    }

    await subtask.deleteOne();

    task!.subtasks = task!.subtasks.filter((id) => id.toString() !== subtaskId);
    await task!.save();

    return res.status(200).json({ message: "Subtarefa excluída com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};
