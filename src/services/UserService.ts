import User, { IUser } from "../models/User";
import { hashPassword } from "../utils/hash-password";

type CreateUserData = {
  name: string;
  email: string;
  password: string;
};

type UserData = Omit<IUser, "_id">;

export const createUser = async (data: CreateUserData): Promise<IUser> => {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new Error("Já existe um usuário com este endereço de e-mail!");
  }

  const passwordHash = await hashPassword(data.password);

  const userData: UserData = {
    name: data.name,
    email: data.email,
    password: passwordHash,
  };

  const userDoc = new User(userData);
  const newUser = await userDoc.save();

  return newUser;
};
