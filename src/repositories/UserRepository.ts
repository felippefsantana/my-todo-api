import { ObjectId } from "mongodb";
import User, { IUser } from "../models/User";

export const findAllUsers = async (): Promise<IUser[]> => {
  return await User.find();
};

export const findUserById = async (id: ObjectId): Promise<IUser | null> => {
  return await User.findById(id);
};

export const createUser = async (userData: IUser): Promise<IUser> => {
  return await User.create(userData);
};

export const updateUser = async (
  id: ObjectId,
  userData: IUser
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(id, userData);
};

export const deleteUser = async (id: ObjectId): Promise<void> => {
  await User.findByIdAndDelete(id);
};
