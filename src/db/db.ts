import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dataBaseUrl = process.env.DATA_BASE_URL;

if (!dataBaseUrl) {
   throw new Error("Missing database URL in environment variables");
}

export const dbConnection = async () => {
   try {
      await mongoose.connect(dataBaseUrl);

      console.log("Database connected successfully");
   } catch (error) {
      console.error("Database connection failed:", error);
      process.exit(1); // Exit the process if the database connection fails
   }
};
