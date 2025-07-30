import { NextResponse } from "next/server";
import UnifiedSearchService from "@/lib/search/unified-search.js";

export async function POST(request) {
  try {
    const { query, userIntegrations } = await request.json();

    console.log("Search API called with:", {
      query: query,
      hasUserIntegrations: !!userIntegrations,
      googleDriveConnected: !!(
        userIntegrations && userIntegrations.googleDrive
      ),
      integrations: Object.keys(userIntegrations || {}),
    });

    if (!query || !userIntegrations) {
      return NextResponse.json(
        {
          success: false,
          message: "Query and user integrations are required",
        },
        { status: 400 }
      );
    }

    const searchService = new UnifiedSearchService();
    const results = await searchService.searchAll(query, userIntegrations);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Search failed",
      },
      { status: 500 }
    );
  }
}
