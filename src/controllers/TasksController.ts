import { Request, Response } from "express";
import { ZodError, z } from "zod";
import { ObjectId } from "mongodb";
import Task, { ITask } from "../models/Task";
import List, { IList } from "../models/List";
import Subtask from "../models/Subtask";
import { IRequestWithUser } from "../interfaces/IRequestWithUser";

type TaskData = Omit<ITask, "_id">;

export const createTask = async (req: Request, res: Response) => {
  const createTaskBody = z.object({
    title: z.string(),
    description: z.string().optional(),
    listId: z.string().optional(),
  });

  try {
    const { title, description, listId } = createTaskBody.parse(req.body);
    let list = undefined;

    const taskData: TaskData = {
      title,
      description,
      subtasks: [],
      owner: (req as IRequestWithUser).user._id,
    };

    if (listId) {
      list = await List.findById(listId);

      if (!list) {
        return res.status(400).json({
          message:
            "Não foi possível criar uma tarefa, pois a lista não existe.",
        });
      }

      taskData.list = list._id;
    }

    const taskDoc = new Task(taskData);
    const newTask = await taskDoc.save();

    if (listId) {
      list?.tasks.push(newTask._id);
      await list?.save();
    }

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
    const task = await Task.findOne({ _id: taskId, owner: userId }).populate(
      "subtasks"
    );
    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const updateTaskBody = z.object({
    title: z.string(),
    description: z.string().optional(),
    listId: z.string().optional(),
  });

  try {
    const { title, description, listId } = updateTaskBody.parse(req.body);
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(400).json({ message: "Tarefa inexistente!" });
    }

    // update list
    if (listId && !task.list) {
      const list = await List.findById(listId);

      if (!list) {
        return res.status(400).json({
          message:
            "Não foi possível atualizar a tarefa, pois a lista não existe.",
        });
      }

      list.tasks.push(task._id);
      await list.save();
    }

    // switch between lists
    if (listId && task.list && listId !== task.list.toString()) {
      const list = await List.findById(listId);

      if (!list) {
        return res.status(400).json({
          message:
            "Não foi possível atualizar a tarefa, pois a lista não existe.",
        });
      }

      // remove task id from tasks array of the list
      const currentList = await List.findById(task.list);
      currentList!.tasks = currentList!.tasks.filter(
        (id) => id.toString() !== task._id.toString()
      );
      await currentList!.save();

      // set "tasks" array of the list
      list.tasks.push(task._id);
      await list.save();
    }

    // remove task from list
    if (!listId && task.list) {
      const list = await List.findById(task.list);

      if (!list) {
        return res.status(400).json({
          message:
            "Não foi possível atualizar a tarefa, pois a lista não existe.",
        });
      }

      list.tasks = list.tasks.filter(
        (id) => id.toString() !== task._id.toString()
      );
      await list.save();
    }

    task.title = title;
    task.description = description;
    task.list = listId ? new ObjectId(listId) : undefined;
    await task.save();

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

    // update tasks array from the list
    if (task.list) {
      const list = await List.findById(task.list);

      list!.tasks = list!.tasks.filter(
        (id) => id.toString() !== task._id.toString()
      );
      await list!.save();
    }

    await task.deleteOne();
    return res.status(200).json({ message: "Tarefa excluída com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};
