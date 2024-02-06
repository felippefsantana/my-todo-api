import mongoose from "mongoose";

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.9ifeadx.mongodb.net/?retryWrites=true&w=majority`;

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME
    });
    console.log("Database connected successfully!");
  } catch (error) {
    console.error(`Error to connect to database: ${error}`);
  }
}
