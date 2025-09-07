import { db } from "../../../../server/db.js";

export async function POST(req) {
  try {
    const { projectId, projectName, fileList } = await req.json();
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
    if (files && files.length > 1) {
      // For now, create a simple star graph from the first file
      const root = files[0].replace(/\W/g, "_");
      mermaid = `graph TD\n  ${files
        .slice(1)
        .map((f) => `${root} --> ${f.replace(/\W/g, "_")}`)
        .join("\n  ")}`;
    } else {
      // Fallback to mock
      mermaid = `graph TD\n      A[App] --> B[Auth]\n      A --> C[API]\n      B --> D[Database]\n      C --> D\n      C --> E[Utils]\n      E --> F[Logger]\n    `;
    }
    return Response.json({ mermaid });
  } catch (error) {
    console.error("Dependency Graph Visualization Error:", error);
    return Response.json(
      { error: "Dependency graph visualization failed." },
      { status: 500 }
    );
  }
}
