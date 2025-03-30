import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { generateEmbedding, summariseCode } from "./gemini.js";
import { db } from "../server/db.js";

// Helper function to validate GitHub URL
const validateGitHubUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") {
      throw new Error("Only GitHub repositories are supported");
    }
    return url;
  } catch (e) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }
};

// Improved GitHub repo loader with better error handling
export const loadGithubRepo = async (githubUrl, githubToken) => {
  const validatedUrl = validateGitHubUrl(githubUrl);
  const token = githubToken || process.env.GITHUB_TOKEN || "";

  if (!token) {
    console.warn(
      "Warning: No GitHub token provided - rate limits may apply (60 req/hour)"
    );
  }

  const loaderConfig = {
    accessToken: token,
    branch: "main", // Default to 'master' as many older repos use this
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 3, // Lower concurrency to avoid rate limits
  };

  try {
    console.log(`Loading repository: ${validatedUrl}`);
    const loader = new GithubRepoLoader(validatedUrl, loaderConfig);
    const docs = await loader.load();
    console.log(`Successfully loaded ${docs.length} documents`);
    return docs;
  } catch (error) {
    if (error.message.includes("rate limit")) {
      throw new Error(
        "GitHub API rate limit exceeded. Please add a GitHub token to increase your limits."
      );
    } else if (error.message.includes("branch")) {
      // Try with 'main' if 'master' fails
      console.log('Trying with "main" branch...');
      return await loadGithubRepo(validatedUrl, {
        ...loaderConfig,
        branch: "main",
      });
    }
    throw new Error(`Failed to load repository: ${error.message}`);
  }
};

// Enhanced embedding generator with rate limiting
const generateEmbeddings = async (docs) => {
  const results = [];

  for (let i = 0; i < docs.length; i++) {
    try {
      const doc = docs[i];
      console.log(
        `Processing document ${i + 1}/${docs.length}: ${doc.metadata.source}`
      );

      const summary = await summariseCode(doc);
      const embedding = await generateEmbedding(summary);

      results.push({
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      });

      // Add delay every 10 documents to avoid rate limits
      // if (i > 0 && i % 10 === 0) {
      //   console.log("Pausing to avoid rate limits...");
      //   await setTimeout(2000);
      // }
    } catch (error) {
      console.error(`Error processing document ${i + 1}:`, error.message);
      results.push(null); // Push null for failed documents
    }
  }

  return results.filter(Boolean); // Remove any null entries
};

// Main indexing function with improved error handling
export const indexGithubRepo = async (projectId, githubUrl, githubToken) => {
  try {
    console.log(`Starting indexing for project ${projectId}`);

    const docs = await loadGithubRepo(githubUrl, githubToken);
    if (!docs || docs.length === 0) {
      throw new Error("No documents found in repository");
    }

    console.log(`Generating embeddings for ${docs.length} documents...`);
    const allEmbeddings = await generateEmbeddings(docs);

    console.log(`Storing ${allEmbeddings.length} embeddings in database...`);
    await Promise.allSettled(
      allEmbeddings.map(async (embedding, index) => {
        try {
          console.log(`Storing embedding ${index + 1}/${allEmbeddings.length}`);

          const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
              summary: embedding.summary,
              sourceCode: embedding.sourceCode,
              fileName: embedding.fileName,
              projectId,
            },
          });

          await db.$executeRaw`
            UPDATE "SourceCodeEmbedding"
            SET "summaryEmbedding" = ${embedding.embedding}::vector
            WHERE "id" = ${sourceCodeEmbedding.id}
          `;
        } catch (error) {
          console.error(
            `Failed to store embedding ${index + 1}:`,
            error.message
          );
        }
      })
    );

    console.log(`Successfully indexed ${allEmbeddings.length} documents`);
    return { success: true, count: allEmbeddings.length };
  } catch (error) {
    console.error("Indexing failed:", error.message);
    throw error;
  }
};

// Test function (optional)
(async () => {
  try {
    // Example usage - replace with your actual values
    const testUrl = "https://github.com/OpenBankProject/OBP-API";
    const testToken = process.env.GITHUB_TOKEN || "";
    const testProjectId = 1;

    console.log("Testing GitHub loader...");
    const docs = await loadGithubRepo(testUrl, testToken);
    console.log(`Loaded ${docs.length} documents`);

    console.log("Testing indexing...");
    const result = await indexGithubRepo(testProjectId, testUrl, testToken);
    console.log("Indexing result:", result);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
})();
