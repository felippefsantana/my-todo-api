import { Request } from "express";
import { IUser } from "../models/User";

export interface IRequestWithUser extends Request {
  user: IUser;
}