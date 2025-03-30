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

export default router;
