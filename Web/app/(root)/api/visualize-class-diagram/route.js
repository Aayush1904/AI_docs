import { db } from "../../../../server/db.js";

export async function POST(req) {
  try {
    const { projectId, projectName, fileList } = await req.json();
    let codeFiles = [];
    if (projectId) {
      codeFiles = await db.sourceCodeEmbedding.findMany({
        where: { projectId },
        select: { sourceCode: true, fileName: true },
      });
    }
    // For now, concatenate all code for AI or static analysis (future: smarter parsing)
    const allCode = codeFiles
      .map((f) => `// ${f.fileName}\n${f.sourceCode}`)
      .join("\n\n");
    let mermaid;
    if (allCode && codeFiles.length > 0) {
      // List each file as a class and connect them with '--' (association)
      const classDefs = codeFiles
        .map((f) => `class ${f.fileName.replace(/\W/g, "_")}`)
        .join("\n  ");
      const relations =
        codeFiles.length > 1
          ? codeFiles
              .slice(1)
              .map(
                (f) =>
                  `${codeFiles[0].fileName.replace(
                    /\W/g,
                    "_"
                  )} -- ${f.fileName.replace(/\W/g, "_")}`
              )
              .join("\n  ")
          : "";
      mermaid = `classDiagram\n  %% Classes extracted from project code (placeholder)\n  ${classDefs}${
        relations ? "\n  " + relations : ""
      }`;
    } else {
      // Fallback to mock
      mermaid = `classDiagram\n      class User {\n        +String name\n        +String email\n        +login()\n        +logout()\n      }\n      class Project {\n        +String title\n        +String description\n        +User owner\n        +addMember()\n      }\n      class Task {\n        +String title\n        +String status\n        +User assignee\n        +complete()\n      }\n      User "1" -- "*" Project : owns\n      Project "1" -- "*" Task : contains\n      User "1" -- "*" Task : assigned to\n    `;
    }
    return Response.json({ mermaid });
  } catch (error) {
    console.error("Class Diagram Visualization Error:", error);
    return Response.json(
      { error: "Class diagram visualization failed." },
      { status: 500 }
    );
  }
}
