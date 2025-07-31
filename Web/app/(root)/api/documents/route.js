import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../server/db.js";
import { getUserAccessibleDocuments } from "../../../../lib/access-control.js";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await getUserAccessibleDocuments(userId);

    return Response.json({
      documents,
      count: documents.length,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return Response.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
