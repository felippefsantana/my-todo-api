import { Request, Response } from "express";
import { ZodError, z } from "zod";
import bcrypt from "bcrypt";
import { hashPassword } from "../utils/hash-password";
import User, { IUser } from "../models/User";

type UserData = Omit<IUser, "_id">;

export const createUser = async (req: Request, res: Response) => {
  const createUserBody = z
    .object({
      name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres!"),
      email: z.string({ required_error: "O email é obrigatório!" }).email("E-mail inválido!"),
      password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres!"),
      confirmPassword: z.string().min(6, "A confirmação de senha deve ter no mínimo 6 caracteres!"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "A confirmação da senha deve ser igual a senha!",
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

    const userData: UserData = {
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
      return res
        .status(400)
        .json({ message: "Dados inválidos", errors: error.errors });
    }

    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const findUser = async (req: Request, res: Response) => {
  const user = req.user;
  return res.status(200).json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const updateUserBody = z.object({
    name: z.string().min(2, "O nome precisa ter no mínimo 2 caracteres!"),
    email: z.string({ required_error: "O email é obrigatório!" }).email("E-mail inválido!"),
  });

  try {
    const { name, email } = updateUserBody.parse(req.body);
    const userId = req.user._id;
    const user = await User.findById(userId);

    user!.name = name;
    user!.email = email;

    await user!.save();

    return res.status(200).json({ message: "Usuário atualizado com sucesso!" });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Dados inválidos", errors: error.errors });
    }

    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const updatePasswordBody = z
    .object({
      password: z.string(),
      newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres!"),
      confirmNewPassword: z.string().min(6, "A confirmação da senha deve ter no mínimo 6 caracteres!"),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "A confirmação da senha deve ser igual a nova senha!",
      path: ["confirmNewPassword"],
    })
    .refine((data) => data.password !== data.newPassword && data.password !== data.confirmNewPassword, {
      message: "A nova senha não pode ser igual a senha anterior!",
      path: ["password"],
    });

  try {
    const { password, newPassword } = updatePasswordBody.parse(req.body);
    const userId = req.user._id;
    const user = await User.findById(userId);
    const passwordMatch = await bcrypt.compare(password, user!.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Senha inválida!" });
    }

    const newPasswordHash = await hashPassword(newPassword);

    user!.password = newPasswordHash;
    await user!.save();

    return res.status(200).json({ message: "Senha atualizada com sucesso!" });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Dados inválidos", errors: error.errors });
    }

    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const deleteUserBody = z.object({
    password: z.string({ required_error: "Confirme sua senha para excluir sua conta." }),
  });

  try {
    const { password } = deleteUserBody.parse(req.body);
    const userId = req.user._id;
    const user = await User.findById(userId);
    const passwordMatch = await bcrypt.compare(password, user!.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Senha inválida!" });
    }

    await user!.deleteOne();

    return res.status(200).json({ message: "Usuário excluído com sucesso!" });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Dados inválidos", errors: error.errors });
    }

    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};
