import express from "express";
import { PrismaClient } from "@prisma/client";
import { pollCommits } from "../../../lib/github.js";
import { indexGithubRepo } from "../../../lib/github-loader.js";

const router = express.Router();
const prisma = new PrismaClient();

// 🟢 Create Project
router.post("/create", async (req, res) => {
  try {
    console.log("Received Data:", req.body);

    const { name, githubUrl, githubToken, userId } = req.body;
    if (!name || !githubUrl || !userId) {
      return res
        .status(400)
        .json({ error: "Name, GitHub URL, and valid User ID are required" });
    }

    const project = await prisma.project.create({
      data: {
        name,
        githubUrl,
        userToProjects: {
          create: {
            user: { connect: { id: userId } },
          },
        },
      },
      include: {
        userToProjects: true,
      },
    });

    console.log("✅ Project Created:", project);
    await indexGithubRepo(project.id, githubUrl, githubToken);
    await pollCommits(project.id);
    res.status(201).json(project);
  } catch (error) {
    console.error("❌ Error creating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getProjects", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        userToProjects: true,
      },
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/commits/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    pollCommits(projectId).then().catch(console.error);
    const commits = await prisma.commit.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(commits);
  } catch (error) {
    console.error("Error fetching commits:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/saveAnswer/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { question, answer, fileReferences, userId } = req.body;

    // Validate inputs
    if (!question?.trim() || !answer?.trim() || !userId) {
      return res
        .status(400)
        .json({ error: "Question, answer, and user ID are required" });
    }

    // Verify project exists
    const projectExists = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!projectExists) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Create question (previously called answer)
    const savedQuestion = await prisma.question.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        fileReferences: fileReferences || null,
        project: { connect: { id: projectId } },
        user: { connect: { id: userId } },
      },
    });

    return res.status(201).json(savedQuestion);
  } catch (error) {
    console.error("Error saving question:", error);
    return res.status(500).json({
      error: "Failed to save question",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/questions/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate project exists
    const projectExists = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!projectExists) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get questions with related user data
    const questions = await prisma.question.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
