import express from "express";
import projectRouter from "./routers/project.js";
import postRouter from "./routers/post.js";

const appRouter = express.Router();

// Register routers
appRouter.use("/projects", projectRouter);
appRouter.use("/posts", postRouter);

export default appRouter;
