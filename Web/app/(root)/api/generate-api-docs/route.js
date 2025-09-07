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
    const { projectName, codeContext } = await req.json();
    if (!projectName || !codeContext) {
      return Response.json(
        { error: "Missing projectName or codeContext" },
        { status: 400 }
      );
    }
    const prompt = `You are an expert open source developer and technical writer. Write professional, detailed API documentation for the following project. Include endpoint descriptions, parameters, request/response examples, authentication details, and any other relevant information. Format the output in markdown.\n\nProject Name: ${projectName}\n\nCode Context: ${codeContext}`;

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    const result = await chatSession.sendMessage(prompt);
    return Response.json({ apiDocs: result.response.text() });
  } catch (error) {
    console.error("API Docs Generation Error:", error);
    return Response.json(
      { error: "API docs generation failed." },
      { status: 500 }
    );
  }
}
