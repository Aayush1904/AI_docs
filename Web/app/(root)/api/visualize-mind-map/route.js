export async function POST(req) {
  try {
    const { projectName } = await req.json();
    // For demo: mock mind map
    const mermaid = `mindmap
      root((Project))
        Code
          Backend
          Frontend
        Documentation
          README
          API Docs
        Features
          Search
          Q&A
          Visualization
    `;
    return Response.json({ mermaid });
  } catch (error) {
    console.error("Mind Map Visualization Error:", error);
    return Response.json(
      { error: "Mind map visualization failed." },
      { status: 500 }
    );
  }
}
