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
  maxOutputTokens: 4096,
  responseMimeType: "text/plain",
};

export async function POST(req) {
  try {
    const { code, filename } = await req.json();
    if (!code) {
      return Response.json({ error: "Missing code input" }, { status: 400 });
    }
    const prompt = `You are an expert developer. Add clear, concise comments to the following code. Use the appropriate comment style for the language. Only return the commented code.\n\n${
      filename ? `Filename: ${filename}\n` : ""
    }Code:\n${code}`;

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    const result = await chatSession.sendMessage(prompt);
    return Response.json({ commentedCode: result.response.text() });
  } catch (error) {
    console.error("Code Comment Generation Error:", error);
    return Response.json(
      { error: "Code comment generation failed." },
      { status: 500 }
    );
  }
}
