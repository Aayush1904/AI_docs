import express from "express";
import projectRouter from "./routers/project.js";
import postRouter from "./routers/post.js";
import commentsRouter from "./routers/comments.js";
import notificationsRouter from "./routers/notifications.js";

const appRouter = express.Router();

// Register routers
appRouter.use("/projects", projectRouter);
appRouter.use("/comments", commentsRouter);
appRouter.use("/notifications", notificationsRouter);
appRouter.use("/posts", postRouter);

export default appRouter;
