import { NextResponse } from "next/server";
import NotionIntegration from "@/lib/integrations/notion.js";

export async function GET() {
  try {
    const notion = new NotionIntegration();
    
    // Check environment variables
    const envCheck = {
      hasInternalSecret: !!process.env.NOTION_INTERNAL_SECRET,
      hasWorkspaceId: !!process.env.NOTION_WORKSPACE_ID,
      internalSecretPrefix: process.env.NOTION_INTERNAL_SECRET?.startsWith('secret_') || false
    };

    if (!process.env.NOTION_INTERNAL_SECRET) {
      return NextResponse.json({
        success: false,
        message: "NOTION_INTERNAL_SECRET not configured",
        envCheck
      }, { status: 400 });
    }

    // Test different search queries
    const testQueries = [
      "", // Empty query to get all pages
      "test",
      "notes",
      "page"
    ];

    const results = {};

    for (const query of testQueries) {
      try {
        const result = await notion.searchPages(query, process.env.NOTION_INTERNAL_SECRET, 10);
        results[query || "empty"] = {
          total: result.total,
          pagesFound: result.pages.length,
          hasMore: result.hasMore,
          samplePages: result.pages.slice(0, 3).map(page => ({
            id: page.id,
            title: page.properties?.title?.title?.[0]?.plain_text || 
                   page.properties?.Name?.title?.[0]?.plain_text || 
                   "Untitled",
            type: page.object,
            url: page.url
          }))
        };
      } catch (error) {
        results[query || "empty"] = {
          error: error.message,
          status: "failed"
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notion integration debug completed",
      envCheck,
      results,
      troubleshooting: {
        noResults: "If all queries return 0 results, your integration may not be shared with any pages/databases",
        nextSteps: [
          "1. Go to your Notion workspace",
          "2. Open any page or database",
          "3. Click 'Share' in the top right",
          "4. Click 'Invite' and search for your integration name",
          "5. Select your integration and click 'Invite'",
          "6. Repeat for all pages/databases you want to search"
        ]
      }
    });
  } catch (error) {
    console.error("Notion debug error:", error);
    return NextResponse.json({
      success: false,
      message: "Notion integration debug failed",
      error: error.message
    }, { status: 500 });
  }
} 