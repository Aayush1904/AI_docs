import { db } from "../../../../server/db.js";

export async function POST(req) {
  try {
    const { projectId, projectName } = await req.json();
    let files = [];
    if (projectId) {
      files = (
        await db.sourceCodeEmbedding.findMany({
          where: { projectId },
          select: { fileName: true },
        })
      ).map((f) => f.fileName);
    }
    let mermaid;
    if (files && files.length > 0) {
      mermaid = `mindmap\n  root((${projectName || "Project"}))\n    ${files
        .map((f) => f.replace(/\W/g, "_"))
        .join("\n    ")}`;
    } else {
      // Fallback to mock
      mermaid = `mindmap\n      root((Project))\n        Code\n          Backend\n          Frontend\n        Documentation\n          README\n          API Docs\n        Features\n          Search\n          Q&A\n          Visualization\n    `;
    }
    return Response.json({ mermaid });
  } catch (error) {
    console.error("Mind Map Visualization Error:", error);
    return Response.json(
      { error: "Mind map visualization failed." },
      { status: 500 }
    );
  }
}
