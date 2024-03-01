import { Express } from "express-serve-static-core";
import { IUser } from "./src/models/User";

declare module "express-serve-static-core" {
  interface Request {
    user: IUser;
  }
}