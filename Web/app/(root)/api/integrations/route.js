import { NextResponse } from "next/server";

// Mock database for demo purposes
let integrations = [];

export async function GET() {
  return NextResponse.json({ integrations });
}

export async function POST(request) {
  try {
    const { sourceId, action, config } = await request.json();

    if (action === "connect") {
      // Simulate connection process
      const integration = {
        id: sourceId,
        status: "connected",
        connectedAt: new Date().toISOString(),
        config: config || {},
      };

      // Remove existing if exists
      integrations = integrations.filter((i) => i.id !== sourceId);
      integrations.push(integration);

      return NextResponse.json({
        success: true,
        message: `${sourceId} connected successfully`,
        integration,
      });
    }

    if (action === "disconnect") {
      integrations = integrations.filter((i) => i.id !== sourceId);

      return NextResponse.json({
        success: true,
        message: `${sourceId} disconnected successfully`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Integration API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
