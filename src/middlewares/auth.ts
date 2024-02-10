import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../controllers/AuthController";
import User from "../models/User";
import { IRequestWithUser } from "../interfaces/IRequestWithUser";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Não autorizado!" });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new Error();
    }

    (req as IRequestWithUser).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido!" });
  }
};
