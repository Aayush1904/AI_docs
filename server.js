import express from "express";
import cors from "cors";
import appRouter from "./server/api/root.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Register API Routes
app.use("/api", appRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
