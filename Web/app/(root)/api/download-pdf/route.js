import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return new Response("File name is required", { status: 400 });
    }

    // Construct the path to the PDF file in the Semantic-Search data directory
    const pdfPath = path.join(
      process.cwd(),
      "../Semantic-Search/data",
      fileName
    );
    console.log("PDF path:", pdfPath);

    try {
      const fileBuffer = await readFile(pdfPath);

      return new Response(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    } catch (error) {
      console.error("Error reading PDF file:", error);
      return new Response("File not found", { status: 404 });
    }
  } catch (error) {
    console.error("Download PDF API Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
