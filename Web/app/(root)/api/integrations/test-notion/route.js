import { NextResponse } from "next/server";
import NotionIntegration from "@/lib/integrations/notion.js";

export async function GET() {
  try {
    const notion = new NotionIntegration();

    // Test if internal secret is configured
    if (!process.env.NOTION_INTERNAL_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: "NOTION_INTERNAL_SECRET not configured",
          error: "Missing environment variable",
        },
        { status: 400 }
      );
    }

    // Test search functionality
    const result = await notion.searchPages(
      "test",
      process.env.NOTION_INTERNAL_SECRET,
      5
    );

    return NextResponse.json({
      success: true,
      message: "Notion integration test successful",
      result: {
        total: result.total,
        pagesFound: result.pages.length,
        hasMore: result.hasMore,
        samplePages: result.pages.slice(0, 3).map((page) => ({
          id: page.id,
          title:
            page.properties?.title?.title?.[0]?.plain_text ||
            page.properties?.Name?.title?.[0]?.plain_text ||
            "Untitled",
          type: page.object,
        })),
      },
    });
  } catch (error) {
    console.error("Notion test error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Notion integration test failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
