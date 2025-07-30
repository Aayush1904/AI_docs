import axios from "axios";

class SlackIntegration {
  constructor() {
    this.clientId = process.env.SLACK_CLIENT_ID;
    this.clientSecret = process.env.SLACK_CLIENT_SECRET;
    this.redirectUri = process.env.SLACK_REDIRECT_URI;
  }

  // Generate OAuth URL for Slack
  generateAuthUrl() {
    const scopes = [
      "channels:read",
      "channels:history",
      "groups:read",
      "groups:history",
      "im:read",
      "im:history",
      "mpim:read",
      "mpim:history",
      "files:read",
      "users:read",
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: scopes.join(","),
      redirect_uri: this.redirectUri,
      state: Math.random().toString(36).substring(7),
    });

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  // Exchange code for access token
  async getTokensFromCode(code) {
    try {
      const response = await axios.post(
        "https://slack.com/api/oauth.v2.access",
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          redirect_uri: this.redirectUri,
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        access_token: response.data.access_token,
        team: response.data.team,
        user: response.data.authed_user,
      };
    } catch (error) {
      console.error("Error getting Slack tokens:", error);
      throw error;
    }
  }

  // Search messages in Slack
  async searchMessages(query, accessToken, page = 1) {
    try {
      const response = await axios.get(
        "https://slack.com/api/search.messages",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            query: query,
            count: 20,
            page: page,
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        messages: response.data.messages.matches || [],
        total: response.data.messages.total,
        page: response.data.messages.page,
        pages: response.data.messages.pages,
      };
    } catch (error) {
      console.error("Error searching Slack messages:", error);
      throw error;
    }
  }

  // Search files in Slack
  async searchFiles(query, accessToken, page = 1) {
    try {
      const response = await axios.get("https://slack.com/api/search.files", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          query: query,
          count: 20,
          page: page,
        },
      });

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return {
        files: response.data.files.matches || [],
        total: response.data.files.total,
        page: response.data.files.page,
        pages: response.data.files.pages,
      };
    } catch (error) {
      console.error("Error searching Slack files:", error);
      throw error;
    }
  }

  // Get channel list
  async getChannels(accessToken) {
    try {
      const response = await axios.get(
        "https://slack.com/api/conversations.list",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            types: "public_channel,private_channel",
            limit: 1000,
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return response.data.channels;
    } catch (error) {
      console.error("Error getting Slack channels:", error);
      throw error;
    }
  }

  // Get user info
  async getUserInfo(accessToken, userId) {
    try {
      const response = await axios.get("https://slack.com/api/users.info", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          user: userId,
        },
      });

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return response.data.user;
    } catch (error) {
      console.error("Error getting Slack user info:", error);
      throw error;
    }
  }
}

export default SlackIntegration;
