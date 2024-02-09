import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../controllers/AuthController";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Não autorizado!" });
    }

    verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido!" });
  }
};
