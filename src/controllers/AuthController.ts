import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ZodError, z } from "zod";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/User";

interface IDataStoredInToken {
  id: string;
  email: string;
}

export const generateToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET ?? "my-secret",
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "30 days" }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(
    token,
    String(process.env.JWT_SECRET)
  ) as IDataStoredInToken;
};

export const login = async (req: Request, res: Response) => {
  const authSchema = z.object({
    email: z.string().min(6, "Informe um email!").email("E-mail inválido!"),
    password: z.string().min(1, "Informe a senha!"),
  });

  try {
    const { email, password } = authSchema.parse(req.body);

    const user: IUser | null = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Nenhum usuário cadastrado com este e-mail!" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Senha inválida!" });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({ message: "Autenticado com sucesso!" });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Dados inválidos", errors: error.errors });
    }

    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};
