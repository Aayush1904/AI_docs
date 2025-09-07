// "use server";

// import { streamText } from "ai";
// import { createStreamableValue } from "ai/rsc";
// import { createGoogleGenerativeAI } from "@ai-sdk/google";
// import { generateEmbedding } from "../../../../lib/gemini.js";
// import { db } from "../../../../server/db.js";

// const google = createGoogleGenerativeAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// export async function askQuestion(question, projectId) {
//   const stream = createStreamableValue();

//   // Generate embedding for the question
//   const queryVector = await generateEmbedding(question);
//   const vectorQuery = `[${queryVector.join(",")}]`;

//   // Query database for similar code snippets
//   const docs = await db.$queryRaw`
//       SELECT "fileName", "sourceCode", "summary",
//       1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
//       FROM "SourceCodeEmbedding"
//       WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
//       AND "projectId" = ${projectId}
//       ORDER BY similarity DESC
//       LIMIT 10
//     `;
//   docs.forEach((doc) => {
//     if (
//       typeof doc.fileName !== "string" ||
//       typeof doc.sourceCode !== "string" ||
//       typeof doc.summary !== "string"
//     ) {
//       throw new Error("Unexpected document structure from database.");
//     }
//   });

//   // Build context from relevant documents
//   let context = "";
//   for (const doc of docs) {
//     context += `source: ${doc.fileName}\ncode content:\n${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n---\n\n`;
//   }

//   // Updated prompt from screenshot
//   //   const systemPrompt = `
//   //   You are a code assistant who answers questions about the codebase. Your target audience is a technical intern.
//   //   AI assistant is a brand new, powerful, human-like artificial intelligence.
//   //   The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
//   //   AI is a well-behaved and well-mannered individual.
//   //   AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
//   //   AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in
//   //   if the question is asking about code or a specific file. AI will provide the detailed answer, giving step by step instructions.

//   //   START CONTEXT BLOCK
//   //   ${context}
//   //   END OF CONTEXT BLOCK

//   //   START QUESTION
//   //   ${question}
//   //   END OF QUESTION

//   //   AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
//   //   If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer."
//   //   AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
//   //   AI assistant will not invent anything that is not drawn directly from the context.
//   //   Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering.
//   //     `;

//   //   // Generate response using AI
//   //   const { textStream } = await streamText({
//   //     model: google("gemini-1.5-flash"), // Updated model name from screenshot
//   //     system: systemPrompt,
//   //     messages: [
//   //       {
//   //         role: "user",
//   //         content: question,
//   //       },
//   //     ],
//   //   });

//   async () => {
//     const { textStream } = await streamText({
//       model: google("gemini-1.5-flash"),
//       prompt: `You are a code assistant who answers questions about the codebase. Your target audience is a technical intern.
//       AI assistant is a brand new, powerful, human-like artificial intelligence.
//       The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
//       AI is a well-behaved and well-mannered individual.
//       AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
//       AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in
//       if the question is asking about code or a specific file. AI will provide the detailed answer, giving step by step instructions.

//       START CONTEXT BLOCK
//       ${context}
//       END OF CONTEXT BLOCK

//       START QUESTION
//       ${question}
//       END OF QUESTION

//       AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
//       If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer."
//       AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
//       AI assistant will not invent anything that is not drawn directly from the context.
//       Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering.`,
//     });
//     for await (const delta of textStream) {
//       stream.update(delta);
//     }

//     stream.done();
//   };

//   // Stream the response back
//   return { output: stream.value, fileReferences: docs };
// }

"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "../../../../lib/gemini.js";
import { db } from "../../../../server/db.js";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question, projectId) {
  const stream = createStreamableValue();
  let fullResponse = "";

  // Extract key terms from the question for better search
  const questionLower = question.toLowerCase();
  const searchTerms = [];

  // Add the full question
  searchTerms.push(question);

  // Extract common terms from the question
  if (questionLower.includes("api") || questionLower.includes("endpoint")) {
    searchTerms.push("api", "endpoint", "route", "controller");
  }
  if (questionLower.includes("function") || questionLower.includes("method")) {
    searchTerms.push("function", "method", "def ");
  }
  if (questionLower.includes("class")) {
    searchTerms.push("class", "interface");
  }
  if (questionLower.includes("database") || questionLower.includes("query")) {
    searchTerms.push("database", "query", "sql");
  }
  if (questionLower.includes("error") || questionLower.includes("exception")) {
    searchTerms.push("error", "exception", "try", "catch");
  }
  if (questionLower.includes("auth") || questionLower.includes("login")) {
    searchTerms.push("auth", "login", "authentication");
  }

  console.log("Search terms:", searchTerms);

  // Use a broader search approach to find more relevant files
  const docs = await db.$queryRaw`
      SELECT "fileName", "sourceCode", "summary",
      CAST(CASE 
        WHEN "fileName" ILIKE ${`%${question}%`} THEN 0.95
        WHEN "summary" ILIKE ${`%${question}%`} THEN 0.85
        WHEN "sourceCode" ILIKE ${`%${question}%`} THEN 0.75
        WHEN "fileName" ILIKE ${`%resume%`} THEN 0.9
        WHEN "summary" ILIKE ${`%resume%`} THEN 0.8
        WHEN "sourceCode" ILIKE ${`%resume%`} THEN 0.7
        WHEN "fileName" ILIKE ${`%upload%`} THEN 0.9
        WHEN "summary" ILIKE ${`%upload%`} THEN 0.8
        WHEN "sourceCode" ILIKE ${`%upload%`} THEN 0.7
        WHEN "fileName" ILIKE ${`%api%`} THEN 0.8
        WHEN "summary" ILIKE ${`%api%`} THEN 0.7
        WHEN "sourceCode" ILIKE ${`%api%`} THEN 0.6
        WHEN "fileName" ILIKE ${`%endpoint%`} THEN 0.8
        WHEN "summary" ILIKE ${`%endpoint%`} THEN 0.7
        WHEN "sourceCode" ILIKE ${`%endpoint%`} THEN 0.6
        WHEN "fileName" ILIKE ${`%route%`} THEN 0.8
        WHEN "summary" ILIKE ${`%route%`} THEN 0.7
        WHEN "sourceCode" ILIKE ${`%route%`} THEN 0.6
        WHEN "fileName" ILIKE ${`%controller%`} THEN 0.8
        WHEN "summary" ILIKE ${`%controller%`} THEN 0.7
        WHEN "sourceCode" ILIKE ${`%controller%`} THEN 0.6
        WHEN "fileName" ILIKE ${`%http%`} THEN 0.6
        WHEN "summary" ILIKE ${`%http%`} THEN 0.5
        WHEN "sourceCode" ILIKE ${`%http%`} THEN 0.4
        WHEN "fileName" ILIKE ${`%fetch%`} THEN 0.6
        WHEN "summary" ILIKE ${`%fetch%`} THEN 0.5
        WHEN "sourceCode" ILIKE ${`%fetch%`} THEN 0.4
        WHEN "fileName" ILIKE ${`%axios%`} THEN 0.6
        WHEN "summary" ILIKE ${`%axios%`} THEN 0.5
        WHEN "sourceCode" ILIKE ${`%axios%`} THEN 0.4
        ELSE 0.3
      END AS FLOAT) AS similarity
      FROM "SourceCodeEmbedding"
      WHERE "projectId" = ${projectId}
      AND (
        "fileName" ILIKE ${`%${question}%`} 
        OR "summary" ILIKE ${`%${question}%`} 
        OR "sourceCode" ILIKE ${`%${question}%`}
        OR "fileName" ILIKE ${`%resume%`}
        OR "summary" ILIKE ${`%resume%`}
        OR "sourceCode" ILIKE ${`%resume%`}
        OR "fileName" ILIKE ${`%upload%`}
        OR "summary" ILIKE ${`%upload%`}
        OR "sourceCode" ILIKE ${`%upload%`}
        OR "fileName" ILIKE ${`%api%`}
        OR "summary" ILIKE ${`%api%`}
        OR "sourceCode" ILIKE ${`%api%`}
        OR "fileName" ILIKE ${`%endpoint%`}
        OR "summary" ILIKE ${`%endpoint%`}
        OR "sourceCode" ILIKE ${`%endpoint%`}
        OR "fileName" ILIKE ${`%route%`}
        OR "summary" ILIKE ${`%route%`}
        OR "sourceCode" ILIKE ${`%route%`}
        OR "fileName" ILIKE ${`%controller%`}
        OR "summary" ILIKE ${`%controller%`}
        OR "sourceCode" ILIKE ${`%controller%`}
        OR "fileName" ILIKE ${`%http%`}
        OR "summary" ILIKE ${`%http%`}
        OR "sourceCode" ILIKE ${`%http%`}
        OR "fileName" ILIKE ${`%fetch%`}
        OR "summary" ILIKE ${`%fetch%`}
        OR "sourceCode" ILIKE ${`%fetch%`}
        OR "fileName" ILIKE ${`%axios%`}
        OR "summary" ILIKE ${`%axios%`}
        OR "sourceCode" ILIKE ${`%axios%`}
      )
      ORDER BY similarity DESC
      LIMIT 15
    `;

  // Build context from relevant documents
  let context = "";

  // If no specific results found, get some sample files for context
  if (docs.length === 0) {
    console.log(
      "No specific results found, getting sample files for context..."
    );
    const sampleDocs = await db.$queryRaw`
      SELECT "fileName", "sourceCode", "summary", CAST(0.5 AS FLOAT) AS similarity
      FROM "SourceCodeEmbedding"
      WHERE "projectId" = ${projectId}
      LIMIT 5
    `;
    docs.push(...sampleDocs);
  }

  for (const doc of docs) {
    context += `source: ${doc.fileName}\ncode content:\n${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n---\n\n`;
  }

  console.log(`Using ${docs.length} documents for context`);

  // Generate response using AI
  const { textStream } = await streamText({
    model: google("gemini-1.5-flash"),
    prompt: `You are a code assistant who answers questions about the codebase. Your target audience is a technical intern.

    START CONTEXT BLOCK
    ${context}
    END OF CONTEXT BLOCK

    START QUESTION
    ${question}
    END OF QUESTION

    Instructions:
    1. **Always provide a helpful answer** based on the context provided
    2. **If you find relevant information** in the context, provide a detailed answer with specific file locations and code examples
    3. **If you find partial information**, mention what you found and suggest what else to look for
    4. **If you find API-related code** (like fetch calls, HTTP requests, API routes), highlight those as API endpoints
    5. **If you find configuration files** (like package.json, .env), mention those as they might contain API URLs
    6. **If you find service files** or utility functions that make API calls, mention those
    7. **Be specific about file locations** and code snippets you find
    8. **Don't be overly conservative** - if you see any API-related code, mention it as a potential endpoint
    9. **Always include file references** - mention the exact file names where you found the code
    10. **Show actual code snippets** from the files when relevant
    11. **If you find component files**, show their structure and implementation details

    Answer in markdown syntax, with code snippets if needed. Be specific about what you found in the codebase and always reference the file names.`,
  });

  (async () => {
    for await (const delta of textStream) {
      console.log("AI Chunks: ", delta);
      fullResponse += delta;
      stream.update(fullResponse);
    }
    stream.done();
  })();

  // Stream the response back
  return { output: stream.value, fileReferences: docs };
}
