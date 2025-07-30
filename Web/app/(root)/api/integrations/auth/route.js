import { NextResponse } from "next/server";
import GoogleDriveIntegration from "@/lib/integrations/google-drive.js";
import SlackIntegration from "@/lib/integrations/slack.js";
import JiraIntegration from "@/lib/integrations/jira.js";
import NotionIntegration from "@/lib/integrations/notion.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const action = searchParams.get("action");

  if (action === "auth_url") {
    let authUrl = "";

    switch (source) {
      case "google-drive":
        const googleDrive = new GoogleDriveIntegration();
        authUrl = googleDrive.generateAuthUrl();
        break;

      case "slack":
        const slack = new SlackIntegration();
        authUrl = slack.generateAuthUrl();
        break;

      case "jira":
        const jira = new JiraIntegration();
        authUrl = jira.generateAuthUrl();
        break;

      case "notion":
        const notion = new NotionIntegration();
        authUrl = notion.generateAuthUrl();
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid source",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      authUrl,
    });
  }

  return NextResponse.json(
    {
      success: false,
      message: "Invalid action",
    },
    { status: 400 }
  );
}

export async function POST(request) {
  try {
    const { source, code, state } = await request.json();

    let tokens = {};

    switch (source) {
      case "google-drive":
        const googleDrive = new GoogleDriveIntegration();
        tokens = await googleDrive.getTokensFromCode(code);
        break;

      case "slack":
        const slack = new SlackIntegration();
        tokens = await slack.getTokensFromCode(code);
        break;

      case "jira":
        const jira = new JiraIntegration();
        console.log("Processing JIRA OAuth...");
        tokens = await jira.getTokensFromCode(code);
        console.log("JIRA tokens obtained:", Object.keys(tokens));

        // For JIRA, we need to get accessible resources (cloud IDs)
        console.log("Getting JIRA accessible resources...");
        const resources = await jira.getAccessibleResources(
          tokens.access_token
        );
        console.log("JIRA resources:", resources);
        tokens.cloudId = resources[0]?.id; // Use first accessible resource
        console.log("Selected cloud ID:", tokens.cloudId);
        break;

      case "notion":
        const notion = new NotionIntegration();
        console.log("Processing Notion Internal Integration...");
        // For internal integrations, we don't need a code, just get tokens directly
        tokens = await notion.getTokensFromCode("internal");
        console.log("Notion tokens obtained:", Object.keys(tokens));
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid source",
          },
          { status: 400 }
        );
    }

    // In a real app, you'd store these tokens securely in a database
    // For demo purposes, we'll return them (not recommended for production)
    return NextResponse.json({
      success: true,
      message: `${source} connected successfully`,
      tokens,
      source,
    });
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Authentication failed",
      },
      { status: 500 }
    );
  }
}
