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
    const { projectName, projectDescription, codeContext } = await req.json();
    if (!projectName || !projectDescription) {
      return Response.json(
        { error: "Missing projectName or projectDescription" },
        { status: 400 }
      );
    }
    const prompt = `
You are an expert open source developer and technical writer. Write a professional, detailed README.md for the following project:

Project Name: ${projectName}

Project Description: ${projectDescription}

${codeContext ? `Code Context: ${codeContext}` : ""}

The README should include:
- A project title and description
- Badges (if appropriate)
- Table of Contents (if appropriate)
- Setup/Installation instructions
- Usage examples
- Contribution guidelines
- License section (use MIT if not specified)
- Any other relevant sections for a high-quality open source README

Format the output in markdown. Use clear section headings and bullet points where helpful.`;

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    const result = await chatSession.sendMessage(prompt);
    return Response.json({ readme: result.response.text() });
  } catch (error) {
    console.error("README Generation Error:", error);
    return Response.json(
      { error: "README generation failed." },
      { status: 500 }
    );
  }
}
