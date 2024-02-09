import { Request, Response } from "express";
import { ZodError, z } from "zod";
import { hashPassword } from "../utils/hash-password";
import User, { IUser } from "../models/User";

export const create = async (req: Request, res: Response) => {
  const createUserBody = z
    .object({
      name: z.string().min(2, "O nome precisa ter no mínimo 2 caracteres!"),
      email: z.string({ required_error: "O email é obrigatório!" }).email("E-mail inválido!"),
      password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres!"),
      confirmPassword: z.string().min(6, "A confirmação de senha precisa ter no mínimo 6 caracteres!"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "A senha não confere com a confirmação da senha!",
      path: ["confirmPassword"],
    });

  try {
    const { name, email, password } = createUserBody.parse(req.body);

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Já existe um usuário com este endereço de e-mail!" });
    }

    const passwordHash = await hashPassword(password);

    const userData: IUser = {
      name,
      email,
      password: passwordHash,
    };

    const userDoc = new User(userData);
    const newUser = await userDoc.save();

    return res.status(201).json({
      message: "Usuário criado com sucesso!",
      data: newUser,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Dados inválidos", errors: error.errors });
    } else {
      res.status(500).json({ message: "Erro interno do servidor", error });
    }
  }
};

export const update = (req: Request, res: Response) => {
  return res.status(200).json({ message: "Autenticado!" });
};
