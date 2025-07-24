import { GoogleGenerativeAI } from "@google/generative-ai";

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

export async function POST(req) {
  try {
    const { query, filter } = await req.json();
    if (!query) {
      return Response.json({ error: "Missing query" }, { status: 400 });
    }
    // Forward to Python backend
    const pyRes = await fetch("http://127.0.0.1:5002/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, filter }),
    });
    if (!pyRes.ok) {
      return Response.json({ error: "Python backend error" }, { status: 500 });
    }
    const data = await pyRes.json();
    return Response.json({ results: data.results });
  } catch (error) {
    console.error("Semantic Search API Error:", error);
    return Response.json({ error: "Semantic search failed." }, { status: 500 });
  }
}
