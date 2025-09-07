import axios from "axios";

class NotionIntegration {
  constructor() {
    this.baseURL = "https://api.notion.com/v1";
    this.internalSecret = process.env.secret_NOTION_INTERNAL_SECRET;
  }

  // Generate auth URL for Notion (using internal integration)
  generateAuthUrl() {
    // For internal integrations, we don't need OAuth flow
    // The internal secret is used directly
    return "notion://internal-integration";
  }

  // Get tokens using internal secret
  async getTokensFromCode(code) {
    try {
      // For internal integrations, we return the internal secret as the access token
      return {
        access_token: this.internalSecret,
        token_type: "Bearer",
        workspace_id: process.env.NOTION_WORKSPACE_ID || "default",
      };
    } catch (error) {
      console.error("Error getting Notion tokens:", error);
      throw error;
    }
  }

  // Search pages in Notion
  async searchPages(query, accessToken, pageSize = 20) {
    try {
      // Use the internal secret if no access token provided
      const token = accessToken || this.internalSecret;

      if (!token) {
        throw new Error("No Notion access token or internal secret provided");
      }

      // First, try to search for pages
      const pageResponse = await axios.post(
        `${this.baseURL}/search`,
        {
          query: query,
          filter: {
            property: "object",
            value: "page",
          },
          page_size: pageSize,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
        }
      );

      // Also search for databases
      const databaseResponse = await axios.post(
        `${this.baseURL}/search`,
        {
          query: query,
          filter: {
            property: "object",
            value: "database",
          },
          page_size: pageSize,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
        }
      );

      // Combine results
      const allResults = [
        ...(pageResponse.data.results || []),
        ...(databaseResponse.data.results || []),
      ];

      return {
        pages: allResults,
        total:
          (pageResponse.data.total || 0) + (databaseResponse.data.total || 0),
        hasMore:
          pageResponse.data.has_more ||
          false ||
          databaseResponse.data.has_more ||
          false,
      };
    } catch (error) {
      console.error("Error searching Notion pages:", error);
      throw error;
    }
  }

  // Get page content
  async getPageContent(pageId, accessToken) {
    try {
      const token = accessToken || this.internalSecret;

      if (!token) {
        throw new Error("No Notion access token or internal secret provided");
      }

      const response = await axios.get(`${this.baseURL}/pages/${pageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error getting Notion page content:", error);
      throw error;
    }
  }

  // Get user info
  async getUserInfo(accessToken) {
    try {
      const token = accessToken || this.internalSecret;

      if (!token) {
        throw new Error("No Notion access token or internal secret provided");
      }

      const response = await axios.get(`${this.baseURL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error getting Notion user info:", error);
      throw error;
    }
  }
}

export default NotionIntegration;
