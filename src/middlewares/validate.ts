import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const response = {
          error: {
            code: 400,
            message: "Dados inválidos",
            details: error.errors.map((error) => ({
              field: error.path[0],
              message: error.message,
            })),
          },
        };

        return res.status(400).json(response);

        // return res.status(400).json({
        //   message: "Dados inválidos",
        //   errors: (error as ZodError).errors,
        // });
      }
    }
  };
