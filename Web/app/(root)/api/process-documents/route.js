import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { spawn } from "child_process";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type");
    let files = [];

    if (contentType && contentType.includes("application/json")) {
      // Handle JSON request (for processing existing documents)
      const body = await request.json();
      files = body.files || [];
    } else {
      // Handle FormData request (for uploading new documents)
      const formData = await request.formData();
      const uploadedFiles = formData.getAll("files");

      if (!uploadedFiles || uploadedFiles.length === 0) {
        return Response.json({ error: "No files provided" }, { status: 400 });
      }

      // Ensure the data directory exists
      const dataDir = path.join(process.cwd(), "../Semantic-Search/data");
      console.log("Current working directory:", process.cwd());
      console.log("Data directory path:", dataDir);
      await mkdir(dataDir, { recursive: true });

      // Save uploaded files to the data directory
      for (const file of uploadedFiles) {
        if (file instanceof File) {
          const fileName = file.name;
          const filePath = path.join(dataDir, fileName);

          // Convert file to buffer and save
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          console.log("Saving file:", fileName, "to:", filePath);
          await writeFile(filePath, buffer);
          console.log("File saved successfully:", fileName);

          files.push(fileName);
        }
      }
    }

    if (files.length === 0) {
      return Response.json({ error: "No files to process" }, { status: 400 });
    }

    // Process the documents using the Python backend
    try {
      const pythonScript = path.join(
        process.cwd(),
        "../Semantic-Search/api_server.py"
      );
      const pythonProcess = spawn("python", [
        pythonScript,
        "process",
        JSON.stringify({ files: files }),
      ]);

      return new Promise((resolve, reject) => {
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
              const response = JSON.parse(result);
              resolve(Response.json(response));
            } catch (e) {
              resolve(
                Response.json({
                  success: true,
                  message: "Documents processed successfully",
                  files: files,
                })
              );
            }
          } else {
            resolve(
              Response.json(
                {
                  error: `Failed to process documents: ${error}`,
                },
                { status: 500 }
              )
            );
          }
        });
      });
    } catch (error) {
      console.error("Error processing documents:", error);
      return Response.json(
        {
          error: "Failed to process documents",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Process Documents API Error:", error);
    return Response.json(
      { error: "Failed to process documents" },
      { status: 500 }
    );
  }
}
