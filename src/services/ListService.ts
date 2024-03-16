import { ObjectId } from "mongodb";
import List, { IList } from "../models/List";

type CreateListData = {
  title: string;
  owner: ObjectId;
};

type UpdateListData = {
  title: string;
  owner: ObjectId;
};

type ListData = Omit<IList, "_id">;

export const createList = async (data: CreateListData): Promise<IList> => {
  const { title, owner } = data;

  const listData: ListData = {
    title,
    owner,
    tasks: [],
  };

  const listDoc = new List(listData);
  const newList = await listDoc.save();

  return newList;
};

export const updateList = async (id: ObjectId, data: UpdateListData): Promise<void> => {
  const { title, owner } = data;
  const list = await List.findOne({ _id: id, owner: owner });

  if (!list) {
    throw new Error("Lista inexistente!");
  }

  list.title = title;
  await list.save();
};

export const deleteList = async (id: ObjectId, userId: ObjectId): Promise<void> => {
  const list = await List.findOne({ _id: id, owner: userId });

  if (!list) {
    throw new Error("Lista inexistente!");
  }

  await list.deleteOne();
};

export const findAllLists = async (userId: ObjectId): Promise<IList[]> => {
  const lists = await List.find({ owner: userId });
  return lists;
};

export const findListById = async (id: ObjectId, userId: ObjectId): Promise<IList | null> => {
  const list = await List.findOne({ _id: id, owner: userId }).populate("tasks");
  return list;
};
