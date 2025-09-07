import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateEmbedding } from "../../../../lib/gemini.js";
import { db } from "../../../../server/db.js";
import { spawn } from "child_process";
import path from "path";
import { auth } from "@clerk/nextjs/server";
import {
  checkDocumentAccess,
  getUserAccessibleDocuments,
} from "../../../../lib/access-control.js";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
  responseMimeType: "text/plain",
};

// Function to call Python backend with timeout
async function callPythonBackend(endpoint, data) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(
      process.cwd(),
      "../Semantic-Search/api_server.py"
    );
    const pythonProcess = spawn("python", [
      pythonScript,
      endpoint,
      JSON.stringify(data),
    ]);

    let result = "";
    let error = "";

    // Set timeout for faster response
    const timeout = setTimeout(() => {
      pythonProcess.kill();
      reject(new Error("Python backend timeout - request took too long"));
    }, 30000); // 30 second timeout

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    pythonProcess.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        try {
          resolve(JSON.parse(result));
        } catch (e) {
          reject(new Error("Invalid JSON response from Python backend"));
        }
      } else {
        reject(new Error(`Python backend error: ${error}`));
      }
    });

    pythonProcess.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start Python backend: ${err.message}`));
    });
  });
}

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      query,
      projectId,
      filter,
      mode = "search",
      accessLevel,
    } = await req.json();

    if (!query) {
      return Response.json({ error: "Missing query" }, { status: 400 });
    }

    // If projectId is provided, use the existing code search logic
    if (projectId) {
      return await handleCodeSearch(query, projectId, filter);
    }

    // Otherwise, use the Python backend for document search and chatbot
    try {
      if (mode === "chatbot") {
        const response = await callPythonBackend("chatbot", {
          query,
          userId,
          accessLevel,
        });

        // Filter sources based on access level
        if (response.sources) {
          response.sources = await filterSourcesByAccess(
            response.sources,
            userId,
            accessLevel
          );
        }
        return Response.json(response);
      } else {
        const response = await callPythonBackend("search", {
          query,
          userId,
          accessLevel,
        });

        // Filter results based on access level
        if (response.results) {
          try {
            response.results = await filterResultsByAccess(
              response.results,
              userId,
              accessLevel
            );
            console.log(
              "Search results after filtering:",
              response.results.length
            );
          } catch (error) {
            console.error("Error filtering results:", error);
            // If filtering fails, return all results
            console.log("Returning unfiltered results due to filtering error");
          }
        }
        return Response.json(response);
      }
    } catch (error) {
      console.error("Python backend error:", error);
      return Response.json(
        {
          error:
            "Search service temporarily unavailable. Please try again in a moment.",
          details: error.message,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Filter search results based on user access
async function filterResultsByAccess(results, userId, accessLevel) {
  if (!results || results.length === 0) return results;

  const filteredResults = [];

  for (const result of results) {
    // Extract document name from result
    const documentName = result.payload?.pdf_name || result.fileName;
    if (!documentName) {
      // If no document name, include the result (be lenient)
      filteredResults.push(result);
      continue;
    }

    try {
      // Find document in database
      const document = await db.document.findFirst({
        where: {
          OR: [
            { fileName: { contains: documentName } },
            { name: { contains: documentName } },
          ],
        },
      });

      if (!document) {
        // If document not found in database, include the result (be lenient)
        console.log(
          `Document not found in database: ${documentName}, including result`
        );
        filteredResults.push(result);
        continue;
      }

      // Check access
      const accessCheck = await checkDocumentAccess(document.id, userId);
      if (accessCheck.hasAccess) {
        // Add access level info to result
        result.accessLevel = document.accessLevel;
        filteredResults.push(result);
      } else {
        console.log(`Access denied for document: ${documentName}`);
      }
    } catch (error) {
      console.error(
        `Error checking access for document ${documentName}:`,
        error
      );
      // If there's an error checking access, include the result (be lenient)
      filteredResults.push(result);
    }
  }

  return filteredResults;
}

// Filter chat sources based on user access
async function filterSourcesByAccess(sources, userId, accessLevel) {
  if (!sources || sources.length === 0) return sources;

  const filteredSources = [];

  for (const source of sources) {
    const documentName = source.pdf_name;
    if (!documentName) continue;

    // Find document in database
    const document = await db.document.findFirst({
      where: {
        OR: [
          { fileName: { contains: documentName } },
          { name: { contains: documentName } },
        ],
      },
    });

    if (!document) continue;

    // Check access
    const accessCheck = await checkDocumentAccess(document.id, userId);
    if (accessCheck.hasAccess) {
      // Add access level info to source
      source.accessLevel = document.accessLevel;
      filteredSources.push(source);
    }
  }

  return filteredSources;
}

async function handleCodeSearch(query, projectId, filter) {
  // First, let's check if there are any records for this project
  const projectRecords = await db.$queryRaw`
      SELECT COUNT(*) as count FROM "SourceCodeEmbedding" WHERE "projectId" = ${projectId}
    `;

  console.log(`Project ${projectId} has ${projectRecords[0].count} records`);

  // Use a simpler, more flexible search approach
  let docs = await db.$queryRaw`
      SELECT "fileName", "sourceCode", "summary", 
      CASE 
        WHEN "fileName" ILIKE ${`%${query}%`} THEN 0.95
        WHEN "summary" ILIKE ${`%${query}%`} THEN 0.85
        WHEN "sourceCode" ILIKE ${`%${query}%`} THEN 0.75
        WHEN "fileName" ILIKE ${`%error%`} AND ${query
    .toLowerCase()
    .includes("error")} THEN 0.65
        WHEN "summary" ILIKE ${`%error%`} AND ${query
    .toLowerCase()
    .includes("error")} THEN 0.55
        WHEN "sourceCode" ILIKE ${`%error%`} AND ${query
    .toLowerCase()
    .includes("error")} THEN 0.45
        WHEN "fileName" ILIKE ${`%handling%`} AND ${query
    .toLowerCase()
    .includes("handling")} THEN 0.65
        WHEN "summary" ILIKE ${`%handling%`} AND ${query
    .toLowerCase()
    .includes("handling")} THEN 0.55
        WHEN "sourceCode" ILIKE ${`%handling%`} AND ${query
    .toLowerCase()
    .includes("handling")} THEN 0.45
        ELSE 0.35
      END AS similarity
      FROM "SourceCodeEmbedding"
      WHERE "projectId" = ${projectId}
      AND (
        "fileName" ILIKE ${`%${query}%`} 
        OR "summary" ILIKE ${`%${query}%`} 
        OR "sourceCode" ILIKE ${`%${query}%`}
        OR "fileName" ILIKE ${`%error%`}
        OR "summary" ILIKE ${`%error%`}
        OR "sourceCode" ILIKE ${`%error%`}
        OR "fileName" ILIKE ${`%handling%`}
        OR "summary" ILIKE ${`%handling%`}
        OR "sourceCode" ILIKE ${`%handling%`}
      )
      ORDER BY similarity DESC
      LIMIT 15
    `;

  console.log(`Found ${docs.length} results for query: "${query}"`);

  // If no results found, let's try a broader search
  if (docs.length === 0) {
    console.log("No results found, trying broader search...");
    const broaderDocs = await db.$queryRaw`
      SELECT "fileName", "sourceCode", "summary", 0.5 AS similarity
      FROM "SourceCodeEmbedding"
      WHERE "projectId" = ${projectId}
      LIMIT 5
    `;
    docs = broaderDocs;
    console.log(`Broad search found ${docs.length} results`);
  }

  // Transform results to match expected format
  let results = docs.map((doc) => ({
    fileName: doc.fileName,
    sourceCode: doc.sourceCode,
    summary: doc.summary,
    similarity: doc.similarity,
    metadata: {
      language: getLanguageFromFileName(doc.fileName),
      size: doc.sourceCode?.length || 0,
    },
  }));

  // Apply language filter on client side if specified
  if (filter?.language && filter.language !== "all") {
    results = results.filter((result) =>
      result.metadata.language
        .toLowerCase()
        .includes(filter.language.toLowerCase())
    );
  }

  return Response.json({ results });
}

function getLanguageFromFileName(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const languageMap = {
    js: "JavaScript",
    jsx: "React JSX",
    ts: "TypeScript",
    tsx: "React TSX",
    py: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    cs: "C#",
    php: "PHP",
    rb: "Ruby",
    go: "Go",
    rs: "Rust",
    swift: "Swift",
    kt: "Kotlin",
    scala: "Scala",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    sass: "Sass",
    json: "JSON",
    xml: "XML",
    md: "Markdown",
    txt: "Text",
    sql: "SQL",
    sh: "Shell",
    bash: "Bash",
    yml: "YAML",
    yaml: "YAML",
    toml: "TOML",
    ini: "INI",
    conf: "Config",
    lock: "Lock File",
    gitignore: "Git Ignore",
    dockerfile: "Dockerfile",
    docker: "Docker",
    env: "Environment",
    example: "Example",
    sample: "Sample",
  };

  return languageMap[extension] || "Unknown";
}
