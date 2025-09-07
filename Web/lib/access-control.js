import { auth } from "@clerk/nextjs/server";
import { db } from "../server/db.js";

/**
 * Access Level Definitions
 */
export const ACCESS_LEVELS = {
  PUBLIC: "public",
  PRIVATE: "private",
  RESTRICTED: "restricted",
  CONFIDENTIAL: "confidential",
};

export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
  VIEWER: "viewer",
};

/**
 * Check if user has access to a document
 */
export async function checkDocumentAccess(documentId, userId) {
  try {
    // Get document and its access level
    const document = await db.document.findUnique({
      where: { id: documentId },
      include: {
        user: true,
        accesses: {
          where: { userId },
          include: { user: true },
        },
      },
    });

    if (!document) {
      return { hasAccess: false, reason: "Document not found" };
    }

    // Document owner always has access
    if (document.uploadedBy === userId) {
      return { hasAccess: true, level: "owner" };
    }

    // Check public access
    if (document.accessLevel === ACCESS_LEVELS.PUBLIC) {
      return { hasAccess: true, level: "public" };
    }

    // Check specific user access
    const userAccess = document.accesses.find(
      (access) => access.userId === userId
    );
    if (userAccess) {
      return { hasAccess: true, level: userAccess.accessLevel };
    }

    return { hasAccess: false, reason: "Access denied" };
  } catch (error) {
    console.error("Error checking document access:", error);
    return { hasAccess: false, reason: "Error checking access" };
  }
}

/**
 * Get user's accessible documents
 */
export async function getUserAccessibleDocuments(userId) {
  try {
    const documents = await db.document.findMany({
      where: {
        OR: [
          { uploadedBy: userId },
          { accessLevel: ACCESS_LEVELS.PUBLIC },
          {
            accesses: {
              some: { userId },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            emailAddress: true,
          },
        },
        accesses: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                emailAddress: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return documents;
  } catch (error) {
    console.error("Error getting accessible documents:", error);
    return [];
  }
}

/**
 * Grant access to a document
 */
export async function grantDocumentAccess(
  documentId,
  userId,
  accessLevel,
  grantedBy
) {
  try {
    const access = await db.documentAccess.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId,
        },
      },
      update: {
        accessLevel,
        grantedBy,
        updatedAt: new Date(),
      },
      create: {
        documentId,
        userId,
        accessLevel,
        grantedBy,
      },
    });

    return { success: true, access };
  } catch (error) {
    console.error("Error granting document access:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Revoke access to a document
 */
export async function revokeDocumentAccess(documentId, userId) {
  try {
    await db.documentAccess.delete({
      where: {
        documentId_userId: {
          documentId,
          userId,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error revoking document access:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if user can manage document access
 */
export async function canManageDocumentAccess(documentId, userId) {
  try {
    const document = await db.document.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!document) return false;

    // Document owner can manage access
    if (document.uploadedBy === userId) return true;

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    return user?.role === USER_ROLES.ADMIN;
  } catch (error) {
    console.error("Error checking management permissions:", error);
    return false;
  }
}

/**
 * Get current user from Clerk
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
