import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateEmbedding } from "../../../../lib/gemini.js";
import { db } from "../../../../server/db.js";
import { spawn } from "child_process";
import path from "path";

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

// Function to call Python backend
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

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    pythonProcess.on("close", (code) => {
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
  });
}

export async function POST(req) {
  try {
    const { query, projectId, filter, mode = "search" } = await req.json();

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
        const response = await callPythonBackend("chatbot", { query });
        return Response.json(response);
      } else {
        const response = await callPythonBackend("search", { query });
        return Response.json(response);
      }
    } catch (error) {
      console.error("Python backend error:", error);
      // Fallback to existing logic if Python backend fails
      return await handleCodeSearch(query, projectId, filter);
    }
  } catch (error) {
    console.error("Semantic Search API Error:", error);
    return Response.json({ error: "Semantic search failed." }, { status: 500 });
  }
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
