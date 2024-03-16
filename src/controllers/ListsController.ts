import { Request, Response } from "express";
import { ZodError, z } from "zod";
import * as ListService from "../services/ListService";
import { ObjectId } from "mongodb";

export const createList = async (req: Request, res: Response) => {
  const createListBody = z.object({
    title: z.string().min(1, "Informe o nome da lista."),
  });

  try {
    const { title } = createListBody.parse(req.body);
    const data = {
      title,
      owner: req.user._id,
    };

    const newList = await ListService.createList(data);

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
    const userId = req.user._id;
    const lists = await ListService.findAllLists(userId);
    return res.json(lists);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const findListById = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const userId = req.user._id;
    const list = await ListService.findListById(new ObjectId(listId), userId);
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const updateList = async (req: Request, res: Response) => {
  const updateBodyList = z.object({
    title: z.string().min(1, "Informe o nome da lista."),
  });

  try {
    const { title } = updateBodyList.parse(req.body);
    const { listId } = req.params;
    const userId = req.user._id;
    const data = {
      title,
      owner: userId
    };

    await ListService.updateList(new ObjectId(listId), data);

    return res.status(200).json({ message: "Lista atualizada com sucesso!" });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Dados inválidos", errors: error.errors });
    }

    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const deleteList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const userId = req.user._id;

    await ListService.deleteList(new ObjectId(listId), userId);

    return res.status(200).json({ message: "Lista excluída com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};
