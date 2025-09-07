import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../../server/db.js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");
    const accessLevel = formData.get("accessLevel") || "public";

    if (!files || files.length === 0) {
      return Response.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedDocuments = [];

    for (const file of files) {
      if (!file.name || file.size === 0) continue;

      // Validate file type
      if (!file.type.includes("pdf")) {
        continue;
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = join(uploadsDir, fileName);

      // Save file to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Save document record to database
      const document = await db.document.create({
        data: {
          name: file.name,
          fileName: fileName,
          filePath: filePath,
          fileSize: file.size,
          mimeType: file.type,
          accessLevel: accessLevel,
          uploadedBy: userId,
          processingStatus: "pending",
        },
      });

      uploadedDocuments.push(document);
    }

    return Response.json({
      success: true,
      documents: uploadedDocuments,
      message: `Successfully uploaded ${uploadedDocuments.length} documents`,
    });
  } catch (error) {
    console.error("Error uploading documents:", error);
    return Response.json(
      { error: "Failed to upload documents" },
      { status: 500 }
    );
  }
}
