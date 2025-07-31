import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../../server/db.js";
import {
  grantDocumentAccess,
  canManageDocumentAccess,
} from "../../../../../lib/access-control.js";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, userEmail, accessLevel } = await request.json();

    if (!documentId || !userEmail || !accessLevel) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if current user can manage access to this document
    const canManage = await canManageDocumentAccess(documentId, userId);
    if (!canManage) {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Find user by email
    const targetUser = await db.user.findUnique({
      where: { emailAddress: userEmail },
    });

    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Grant access
    const result = await grantDocumentAccess(
      documentId,
      targetUser.id,
      accessLevel,
      userId
    );

    if (result.success) {
      return Response.json({
        success: true,
        message: "Access granted successfully",
        access: result.access,
      });
    } else {
      return Response.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Error granting document access:", error);
    return Response.json({ error: "Failed to grant access" }, { status: 500 });
  }
}
