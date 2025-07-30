import { NextResponse } from "next/server";
import GoogleDriveIntegration from "@/lib/integrations/google-drive.js";

export async function POST(request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Access token is required",
        },
        { status: 400 }
      );
    }

    const googleDrive = new GoogleDriveIntegration();

    // Handle different token formats
    let credentials;
    if (typeof accessToken === "string") {
      credentials = { access_token: accessToken };
    } else {
      credentials = accessToken;
    }

    console.log("Setting credentials:", credentials);
    googleDrive.setCredentials(credentials);

    // Test 1: List all files (skip user info for now)
    console.log("Testing Google Drive access...");
    let userInfo = null;
    try {
      userInfo = await googleDrive.getUserInfo();
      console.log("✅ User info:", userInfo);
    } catch (error) {
      console.log("⚠️ User info failed, but continuing with file tests...");
    }

    // Test 2: List all files
    const allFiles = await googleDrive.listAllFiles();
    console.log("✅ All files found:", allFiles.files.length);

    // Test 3: Search for a simple term
    const searchResults = await googleDrive.searchFiles("test");
    console.log("✅ Search results:", searchResults.files.length);

    return NextResponse.json({
      success: true,
      userInfo,
      totalFiles: allFiles.files.length,
      searchResults: searchResults.files.length,
      sampleFiles: allFiles.files.slice(0, 5).map((file) => ({
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
      })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Debug failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
