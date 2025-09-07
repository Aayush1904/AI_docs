import { NextResponse } from "next/server";
import JiraIntegration from "@/lib/integrations/jira.js";

export async function GET(request) {
  try {
    // Get JIRA tokens from localStorage (simulate what the frontend does)
    const jiraTokens = {
      access_token: "your_jira_access_token_here", // You'll need to get this from your browser
      cloudId: "1cb62cdc-857e-48c2-a97f-52715eb16173",
    };

    const jira = new JiraIntegration();

    // Test 1: Get all projects
    console.log("Testing JIRA projects...");
    const projects = await jira.getProjects(
      jiraTokens.access_token,
      jiraTokens.cloudId
    );
    console.log("Projects found:", projects.length);

    // Test 2: Search for all issues (empty query should return recent issues)
    console.log("Testing JIRA search with empty query...");
    const allIssues = await jira.searchIssues(
      "",
      jiraTokens.access_token,
      jiraTokens.cloudId
    );
    console.log("All issues found:", allIssues.total);

    // Test 3: Search with a simple term
    console.log('Testing JIRA search with "bug"...');
    const bugIssues = await jira.searchIssues(
      "bug",
      jiraTokens.access_token,
      jiraTokens.cloudId
    );
    console.log("Bug issues found:", bugIssues.total);

    return NextResponse.json({
      success: true,
      projects: {
        count: projects.length,
        sample: projects.slice(0, 3).map((p) => ({ key: p.key, name: p.name })),
      },
      issues: {
        total: allIssues.total,
        sample: allIssues.issues.slice(0, 3).map((i) => ({
          key: i.key,
          summary: i.fields.summary,
          status: i.fields.status.name,
        })),
      },
      search: {
        bugIssues: bugIssues.total,
        sample: bugIssues.issues.slice(0, 3).map((i) => ({
          key: i.key,
          summary: i.fields.summary,
        })),
      },
    });
  } catch (error) {
    console.error("JIRA test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message:
          "JIRA test failed - you may need to provide a valid access token",
      },
      { status: 500 }
    );
  }
}
