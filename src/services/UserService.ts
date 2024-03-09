import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/User";
import { hashPassword } from "../utils/hash-password";

type CreateUserData = {
  name: string;
  email: string;
  password: string;
};

type UpdateUserData = {
  name: string;
  email: string;
};

type UpdatePasswordData = {
  password: string;
  newPassword: string;
};

type DeleteUserData = {
  password: string;
};

type UserData = Omit<IUser, "_id">;

export const createUser = async (data: CreateUserData): Promise<IUser> => {
  const { name, email, password } = data;
  const existingUser = await User.findOne({ email: email });

  if (existingUser) {
    throw new Error("Já existe um usuário com este endereço de e-mail!");
  }

  const passwordHash = await hashPassword(password);

  const userData: UserData = {
    name: name,
    email: email,
    password: passwordHash,
  };

  const userDoc = new User(userData);
  const newUser = await userDoc.save();

  return newUser;
};

export const updateUser = async (id: ObjectId, data: UpdateUserData): Promise<void> => {
  const { name, email } = data;
  const user = await User.findById(id);

  user!.name = name;
  user!.email = email;

  await user!.save();
}

export const updatePassword = async (id: ObjectId, data: UpdatePasswordData): Promise<void> => {
  const { password, newPassword } = data;
  const user = await User.findById(id);
  const passwordMatch = await bcrypt.compare(password, user!.password);

  if (!passwordMatch) {
    throw new Error("Senha inválida!");
  }

  const newPasswordHash = await hashPassword(newPassword);

  user!.password = newPasswordHash;
  await user!.save();
};

export const deleteUser = async (id: ObjectId, data: DeleteUserData): Promise<void> => {
  const { password } = data;
  const user = await User.findById(id);
  const passwordMatch = await bcrypt.compare(password, user!.password);

  if (!passwordMatch) {
    throw new Error("Senha inválida!");
  }

  await user!.deleteOne();
};
