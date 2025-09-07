import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/notifications?userId=xxx&projectId=yyy
router.get("/", async (req, res) => {
  try {
    const { userId, projectId } = req.query;
    if (!userId || !projectId) {
      return res
        .status(400)
        .json({ error: "userId and projectId are required" });
    }
    const notifications = await prisma.notification.findMany({
      where: { userId, projectId },
      orderBy: { timestamp: "desc" },
    });
    res.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// POST /api/notifications
router.post("/", async (req, res) => {
  try {
    const { userId, projectId, message } = req.body;
    if (!userId || !projectId || !message) {
      return res
        .status(400)
        .json({ error: "userId, projectId, and message are required" });
    }
    const notification = await prisma.notification.create({
      data: {
        userId,
        projectId,
        message,
        read: false,
        timestamp: new Date(),
      },
    });
    res.status(201).json({ notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

export default router;
