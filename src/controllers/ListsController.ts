import { Request, Response } from "express";
import { ZodError, z } from "zod";
import List, { IList } from "../models/List";
import { IRequestWithUser } from "../interfaces/IRequestWithUser";

type ListData = Omit<IList, "_id">;

export const createList = async (req: Request, res: Response) => {
  const createListBody = z.object({
    title: z.string().min(1, "Informe o nome da lista."),
  });

  try {
    const { title } = createListBody.parse(req.body);

    const listData: ListData = {
      title,
      owner: (req as IRequestWithUser).user._id,
      tasks: [],
    };

    const listDoc = new List(listData);
    const newList = await listDoc.save();

    return res.status(201).json({
      message: "Lista criada com sucesso!",
      data: newList,
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

export const findAllLists = async (req: Request, res: Response) => {
  try {
    const userId = (req as IRequestWithUser).user._id;
    const lists = await List.find({ owner: userId });
    return res.json(lists);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const findListById = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const userId = (req as IRequestWithUser).user._id;
    const list = await List.findOne({ _id: listId, owner: userId }).populate(
      "tasks"
    );
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const deleteList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const list = await List.findById(listId);

    if (!list) {
      return res.status(400).json({ message: "Lista inexistente!" });
    }

    await list.deleteOne();
    return res.status(200).json({ message: "Lista excluída com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};
