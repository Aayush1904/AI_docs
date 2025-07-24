import { db } from "../../../../server/db.js";

export async function POST(req) {
  try {
    const { projectId, projectName, fileList } = await req.json();
    let files = fileList;
    // If no fileList provided, fetch from DB using projectId
    if (!files && projectId) {
      // Fetch all file names for this project from SourceCodeEmbedding
      files = (
        await db.sourceCodeEmbedding.findMany({
          where: { projectId },
          select: { fileName: true },
        })
      ).map((f) => f.fileName);
    }
    // Fallback to mock if still no files
    files = files || [
      "README.md",
      "package.json",
      "src/index.js",
      "src/components/Button.jsx",
      "src/components/Header.jsx",
      "src/utils/helpers.js",
      "public/logo.svg",
      "public/index.html",
      "test/app.test.js",
    ];
    // Convert file list to Mermaid file tree syntax
    function buildTree(files) {
      const tree = {};
      files.forEach((path) => {
        const parts = path.split("/");
        let node = tree;
        parts.forEach((part, idx) => {
          if (!node[part]) node[part] = idx === parts.length - 1 ? null : {};
          node = node[part] || {};
        });
      });
      return tree;
    }
    function treeToMermaid(tree, parent = "root") {
      let lines = [];
      Object.entries(tree).forEach(([name, child]) => {
        const id = `${parent}_${name.replace(/\W/g, "")}`;
        lines.push(`${parent} --> ${id}[${name}]`);
        if (child && typeof child === "object") {
          lines = lines.concat(treeToMermaid(child, id));
        }
      });
      return lines;
    }
    const tree = buildTree(files);
    const mermaid = ["graph TD", "root[Project]", ...treeToMermaid(tree)].join(
      "\n"
    );
    return Response.json({ mermaid });
  } catch (error) {
    console.error("Visualization API Error:", error);
    return Response.json({ error: "Visualization failed." }, { status: 500 });
  }
}
