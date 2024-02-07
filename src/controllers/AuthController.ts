import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ZodError, z } from "zod";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/User";

const authSchema = z.object({
  email: z.string().min(6, "Informe um email!").email("E-mail inválido!"),
  password: z.string().min(1, "Informe a senha!"),
});

export const generateToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.SECRET ?? "",
    { expiresIn: "24h" }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, String(process.env.SECRET));
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = authSchema.parse(req.body);

    const user: IUser | null = await User.findOne({ email: email });

    if (!user) {
      res
        .status(422)
        .json({ message: "Nenhum usuário cadastrado com este e-mail!" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(422).json({ message: "Senha inválida!" });
      return;
    }

    const token = generateToken(user);

    res
      .status(200)
      .json({ message: "Autenticado com sucesso!", token });
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
