import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../../../server/db.js";
import {
  revokeDocumentAccess,
  canManageDocumentAccess,
} from "../../../../../../lib/access-control.js";

export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    const { accessId } = params;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!accessId) {
      return Response.json({ error: "Access ID required" }, { status: 400 });
    }

    // Get the access record to check permissions
    const accessRecord = await db.documentAccess.findUnique({
      where: { id: accessId },
      include: { document: true },
    });

    if (!accessRecord) {
      return Response.json(
        { error: "Access record not found" },
        { status: 404 }
      );
    }

    // Check if current user can manage access to this document
    const canManage = await canManageDocumentAccess(
      accessRecord.documentId,
      userId
    );
    if (!canManage) {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Revoke access
    const result = await revokeDocumentAccess(
      accessRecord.documentId,
      accessRecord.userId
    );

    if (result.success) {
      return Response.json({
        success: true,
        message: "Access revoked successfully",
      });
    } else {
      return Response.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Error revoking document access:", error);
    return Response.json({ error: "Failed to revoke access" }, { status: 500 });
  }
}
