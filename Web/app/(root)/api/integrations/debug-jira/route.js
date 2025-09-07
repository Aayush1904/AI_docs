import { NextResponse } from "next/server";
import JiraIntegration from "@/lib/integrations/jira.js";

export async function GET(request) {
  try {
    const jira = new JiraIntegration();

    // Test configuration
    const config = {
      clientId: jira.clientId ? "set" : "missing",
      clientSecret: jira.clientSecret ? "set" : "missing",
      redirectUri: jira.redirectUri,
    };

    // Generate auth URL for testing
    const authUrl = jira.generateAuthUrl();

    return NextResponse.json({
      success: true,
      config,
      authUrl,
      message: "JIRA configuration check completed",
    });
  } catch (error) {
    console.error("JIRA debug error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "JIRA configuration check failed",
      },
      { status: 500 }
    );
  }
}
