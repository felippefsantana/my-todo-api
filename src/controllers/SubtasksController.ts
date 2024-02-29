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
    }

    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const updateSubtask = async (req: Request, res: Response) => {
  const updateSubtaskBody = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  });

  try {
    const { title, description } = updateSubtaskBody.parse(req.body);
    const { subtaskId } = req.params;

    const subtask = await Subtask.findById(subtaskId);

    if (!subtask) {
      return res.status(400).json({ message: "Subtarefa inexistente!" });
    }

    await subtask.updateOne({ title, description });
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

export const deleteSubtask = async (req: Request, res: Response) => {
  try {
    const { subtaskId } = req.params;
    const subtask = await Subtask.findById(subtaskId);

    if (!subtask) {
      return res.status(400).json({ message: "Subtarefa inexistente!" });
    }

    await subtask.deleteOne();

    const taskId = subtask.task;
    const task = await Task.findById(taskId);

    task!.subtasks = task!.subtasks.filter(id => id.toString() !== subtaskId);
    await task!.save();

    return res.status(200).json({ message: "Subtarefa excluída com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};
