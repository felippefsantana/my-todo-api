import { Request, Response } from "express";
import { z } from "zod";
import Task, { ITask } from "../models/Task";

export const create = (req: Request, res: Response) => {
  const createTaskBody = z.object({
    title: z.string(),
    description: z.string(),
  });
};
