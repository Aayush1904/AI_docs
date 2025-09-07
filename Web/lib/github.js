import { db } from "../server/db.js";
import axios from "axios";
import { Octokit } from "octokit";
import { aiSummariseCommit } from "./gemini.js";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * Fetches commit hashes from a specified GitHub repository.
 * @param {string} githubUrl - The URL of the GitHub repository.
 * @returns {Promise<Array>} - A promise that resolves to a list of commit details.
 */
export const getCommitHashes = async (githubUrl) => {
  const urlParts = githubUrl.replace("https://github.com/", "").split("/");
  const owner = urlParts[0];
  const repo = urlParts[1];

  if (!owner || !repo) {
    throw new Error("Invalid GitHub repository URL");
  }

  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner: owner,
      repo: repo,
    });
    console.log("Fetched Commits:", data.length);
    if (!data || data.length === 0) {
      throw new Error("No commits found in the repository.");
    }
    const sortedCommits = data.sort(
      (a, b) =>
        new Date(b.commit.author.date).getTime() -
        new Date(a.commit.author.date).getTime()
    );

    return sortedCommits.slice(0, 10).map((commit) => ({
      commitHash: commit.sha,
      commitMessage: commit.commit.message,
      commitAuthorName: commit.commit.author.name ?? "",
      commitAuthorAvatar: commit.author?.avatar_url ?? "",
      commitDate: commit.commit.author.date ?? "",
    }));
  } catch (error) {
    // Handle GitHub API rate limit error
    if (
      error.status === 403 &&
      error.message &&
      error.message.includes("rate limit")
    ) {
      throw new Error(
        "GitHub API rate limit exceeded. Please add a GitHub token or try again later."
      );
    }
    throw error;
  }
};

// Caching logic for commits
export const getCachedCommits = async (projectId) => {
  // Get the most recent commit for this project
  const latestCommit = await db.commit.findFirst({
    where: { projectId },
    orderBy: { commitDate: "desc" },
  });
  if (latestCommit) {
    const commitAge = Date.now() - new Date(latestCommit.commitDate).getTime();
    // If the latest commit is less than 5 minutes old, use cache
    if (commitAge < 5 * 60 * 1000) {
      return await db.commit.findMany({
        where: { projectId },
        orderBy: { commitDate: "desc" },
      });
    }
  }
  // Otherwise, return null to indicate cache miss
  return null;
};

export const pollCommits = async (projectId) => {
  // Check cache first
  const cached = await getCachedCommits(projectId);
  if (cached && cached.length > 0) {
    return cached;
  }
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes
  );
  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) => {
      return summariseCommit(githubUrl, commit.commitHash);
    })
  );
  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value;
    }
    return "";
  });

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      console.log(`Processing Commit ${index}:`, unprocessedCommits[index]);
      return {
        projectId: projectId,
        commitHash: unprocessedCommits[index].commitHash,
        commitMessage: unprocessedCommits[index].commitMessage,
        commitAuthorName: unprocessedCommits[index].commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index].commitAuthorAvatar,
        commitDate: unprocessedCommits[index].commitDate,
        summary: summary,
      };
    }),
  });
  console.log("Inserted Commits:", commits);
  return commits;
};

// async function summariseCommit(githubUrl, commitHash) {
//   console.log("Summarizing commit:", commitHash);
//   const data = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
//     headers: {
//       Accept: "application/vnd.github.v3.diff",
//     },
//   });
//   if (!data) {
//     throw new Error("Failed to fetch diff for commit: " + commitHash);
//   }
//   const summary = await aiSummariseCommit(data);
//   console.log("Generated Summary:", summary);

//   return summary || "";
// }

async function summariseCommit(githubUrl, commitHash) {
  console.log("Summarizing commit:", commitHash);
  const response = await axios.get(`${githubUrl}/commit/${commitHash}.diff`);
  // const response = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
  //   headers: {
  //     Accept: "application/vnd.github.v3.diff",
  //   },
  // });
  if (!response?.data) {
    throw new Error("Failed to fetch diff for commit: " + commitHash);
  }
  const diffText = response.data;
  console.log(`Diff length for commit ${commitHash}:`, diffText.length);
  console.log(`Diff snippet:`, diffText.substring(0, 200));

  const summary = await aiSummariseCommit(diffText);
  console.log("Generated Summary:", summary);
  return summary || "";
}

async function fetchProjectGithubUrl(projectId) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });
  if (!project?.githubUrl) {
    throw new Error("Project has no github URL");
  }
  return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(projectId, commitHashes) {
  console.log("Filtering commits for project:", projectId);
  console.log("Total Commits Before Filtering:", commitHashes.length);
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  });

  console.log("Processed Commits in DB:", processedCommits.length);

  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash
      )
  );

  console.log("Unprocessed Commits:", unprocessedCommits.length);

  return unprocessedCommits;
}
