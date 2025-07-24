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

  // Generate embedding for the question
  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  // Query database for similar code snippets
  const docs = await db.$queryRaw`
      SELECT "fileName", "sourceCode", "summary",
      1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
      FROM "SourceCodeEmbedding"
      WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
      AND "projectId" = ${projectId}
      ORDER BY similarity DESC
      LIMIT 10
    `;

  // Build context from relevant documents
  let context = "";
  for (const doc of docs) {
    context += `source: ${doc.fileName}\ncode content:\n${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n---\n\n`;
  }

  // Generate response using AI
  const { textStream } = await streamText({
    model: google("gemini-1.5-flash"),
    prompt: `You are a code assistant who answers questions about the codebase. Your target audience is a technical intern.
    AI assistant is a brand new, powerful, human-like artificial intelligence.
    The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
    AI is a well-behaved and well-mannered individual.
    AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
    AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in
    if the question is asking about code or a specific file. AI will provide the detailed answer, giving step by step instructions.

    START CONTEXT BLOCK
    ${context}
    END OF CONTEXT BLOCK

    START QUESTION
    ${question}
    END OF QUESTION

    AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
    If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer."
    AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
    AI assistant will not invent anything that is not drawn directly from the context.
    Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering.`,
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
