import express, { Request, Response } from "express";
import "dotenv/config";
import { connectDB } from "./db/connetion";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";

const port = 3333;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
