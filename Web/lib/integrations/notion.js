import axios from "axios";

class NotionIntegration {
  constructor() {
    this.baseURL = "https://api.notion.com/v1";
  }

  // Generate OAuth URL for Notion
  generateAuthUrl() {
    const clientId = process.env.NOTION_CLIENT_ID;
    const redirectUri = process.env.NOTION_REDIRECT_URI;

    return `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}`;
  }

  // Exchange code for tokens
  async getTokensFromCode(code) {
    try {
      const response = await axios.post(
        "https://api.notion.com/v1/oauth/token",
        {
          grant_type: "authorization_code",
          code: code,
          redirect_uri: process.env.NOTION_REDIRECT_URI,
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
            ).toString("base64")}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error getting Notion tokens:", error);
      throw error;
    }
  }

  // Search pages in Notion
  async searchPages(query, accessToken, pageSize = 20) {
    try {
      const response = await axios.post(
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
            Authorization: `Bearer ${accessToken}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
        }
      );

      return {
        pages: response.data.results || [],
        total: response.data.total || 0,
        hasMore: response.data.has_more || false,
      };
    } catch (error) {
      console.error("Error searching Notion pages:", error);
      throw error;
    }
  }

  // Get page content
  async getPageContent(pageId, accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/pages/${pageId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
      const response = await axios.get(`${this.baseURL}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
