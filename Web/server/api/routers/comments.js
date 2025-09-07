import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/comments?commitId=xxx
router.get("/", async (req, res) => {
  try {
    const { commitId } = req.query;
    if (!commitId) {
      return res.status(400).json({ error: "commitId is required" });
    }
    const comments = await prisma.comment.findMany({
      where: { commitId: commitId },
      orderBy: { createdAt: "asc" },
      include: { user: true },
    });
    res.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST /api/comments
router.post("/", async (req, res) => {
  try {
    const { text, userId, projectId, commitId } = req.body;
    if (!text || !userId || !projectId || !commitId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const comment = await prisma.comment.create({
      data: {
        text,
        userId,
        projectId,
        commitId,
      },
      include: { user: true },
    });
    res.status(201).json({ comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// PUT /api/comments
router.put("/", async (req, res) => {
  try {
    const { id, text, userId } = req.body;
    if (!id || !text || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Only allow editing by the comment owner
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment || comment.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await prisma.comment.update({
      where: { id },
      data: { text },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// DELETE /api/comments
router.delete("/", async (req, res) => {
  try {
    const { id, userId } = req.body;
    if (!id || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Only allow deleting by the comment owner
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment || comment.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await prisma.comment.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router; 