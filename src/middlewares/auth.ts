import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { verifyToken } from "../controllers/AuthController";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Não autorizado!" });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new Error();
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido!" });
  }
};
