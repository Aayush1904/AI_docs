import axios from "axios";

class JiraIntegration {
  constructor() {
    this.clientId = process.env.JIRA_CLIENT_ID;
    this.clientSecret = process.env.JIRA_CLIENT_SECRET;
    this.redirectUri = process.env.JIRA_REDIRECT_URI;
  }

  // Generate OAuth URL for JIRA
  generateAuthUrl() {
    const scopes = [
      "read:jira-work",
      "read:jira-user",
      "read:jira:jira",
      "read:issue:jira",
      "read:project:jira",
      "read:board:jira-agile",
      "read:jira-user:jira",
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: scopes.join(" "),
      redirect_uri: this.redirectUri,
      response_type: "code",
      state: Math.random().toString(36).substring(7),
      prompt: "consent", // Force consent screen
      audience: "api.atlassian.com",
    });

    return `https://auth.atlassian.com/authorize?${params.toString()}`;
  }

  // Exchange code for access token
  async getTokensFromCode(code) {
    try {
      console.log("Exchanging JIRA code for tokens...");
      console.log("Code:", code.substring(0, 20) + "...");
      console.log("Client ID:", this.clientId ? "set" : "missing");
      console.log("Client Secret:", this.clientSecret ? "set" : "missing");
      console.log("Redirect URI:", this.redirectUri);

      // URL decode the code if it's encoded
      const decodedCode = decodeURIComponent(code);

      const response = await axios.post(
        "https://auth.atlassian.com/oauth/token",
        {
          grant_type: "authorization_code",
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: decodedCode,
          redirect_uri: this.redirectUri,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("JIRA token exchange successful");
      console.log("Response data keys:", Object.keys(response.data));

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
      };
    } catch (error) {
      console.error(
        "Error getting JIRA tokens:",
        error.response?.data || error.message
      );
      console.error("Full error:", error);

      // Log more details about the request
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        console.error("Response data:", error.response.data);
      }

      throw error;
    }
  }

  // Search issues in JIRA
  async searchIssues(query, accessToken, cloudId, page = 0) {
    try {
      console.log("Searching JIRA issues...");
      console.log("Query:", query);
      console.log("Cloud ID:", cloudId);
      console.log("Access token present:", !!accessToken);

      // Extract keywords from the query (similar to Google Drive)
      const keywords = this.extractKeywords(query);
      console.log("Extracted keywords for JIRA:", keywords);

      // Clean the query for JQL - remove special characters that cause issues
      const cleanQuery = query
        .replace(/[?*]/g, "") // Remove ? and * characters
        .replace(/[^\w\s]/g, " ") // Replace other special chars with spaces
        .trim()
        .split(" ")
        .filter((word) => word.length > 0)
        .join(" ");

      console.log("Cleaned query for JQL:", cleanQuery);

      // First, let's get all available projects to see what we're working with
      try {
        const projectsResponse = await axios.get(
          `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );

        console.log(
          "Available JIRA projects:",
          projectsResponse.data.map((p) => ({
            key: p.key,
            name: p.name,
            id: p.id,
          }))
        );
      } catch (error) {
        console.log("Could not fetch projects:", error.message);
      }

      // Try multiple search strategies
      let jql = "";
      const queryLower = query.toLowerCase();

      // Check for specific assignee names in the query
      const assigneeNames = this.extractAssigneeNames(query);
      console.log("Extracted assignee names:", assigneeNames);

      if (assigneeNames.length > 0) {
        console.log("Searching for tasks assigned to specific people...");

        // Map search names to exact JIRA assignee names
        const assigneeMapping = {
          "utsavi bagri": "Utsavi Bagri",
          utsavi: "Utsavi Bagri",
          "siddharth kumbharkar": "Siddharthkumbharkar1503",
          siddharthkumbharkar1503: "Siddharthkumbharkar1503",
          "siddhart kumbhakar": "Siddharthkumbharkar1503",
          "aayush agrawal": "asagrawal612",
          asagrawal612: "asagrawal612",
          aayush: "asagrawal612",
        };

        const exactAssigneeNames = assigneeNames.map(
          (name) => assigneeMapping[name.toLowerCase()] || name
        );

        const assigneeQueries = exactAssigneeNames.map(
          (name) => `assignee = "${name}"`
        );

        jql = `(${assigneeQueries.join(
          " OR "
        )}) AND (project = "SCRUM" OR project = "HACKAHOLIC") ORDER BY updated DESC`;
      }
      // Check for organization queries
      else if (
        queryLower.includes("organisation") ||
        queryLower.includes("organization") ||
        queryLower.includes("company") ||
        queryLower.includes("neural docs")
      ) {
        console.log("Searching for organization information...");
        jql = `(project = "SCRUM" OR project = "HACKAHOLIC") ORDER BY updated DESC`;
      }
      // Check for general assigned tasks
      else if (
        queryLower.includes("assigned") ||
        queryLower.includes("my") ||
        queryLower.includes("me") ||
        queryLower.includes("i have")
      ) {
        console.log("Searching for assigned tasks...");
        // Search for all issues in NeuralDocs projects, not just assigned ones
        jql = `(project = "SCRUM" OR project = "HACKAHOLIC") ORDER BY updated DESC`;
      }
      // If the query mentions "neural docs" or "dashboard", prioritize NeuralDocs projects
      else if (
        queryLower.includes("neural") ||
        queryLower.includes("docs") ||
        queryLower.includes("dashboard")
      ) {
        console.log("Searching for NeuralDocs specific tasks...");
        jql = `(project = "SCRUM" OR project = "HACKAHOLIC") AND (${keywords
          .map((k) => `summary ~ "${k}" OR description ~ "${k}"`)
          .join(" OR ")}) ORDER BY updated DESC`;
      }

      // If no specific JQL was set by the above conditions, use the default
      if (!jql) {
        if (keywords.length > 0) {
          // Search with keywords - try to find NeuralDocs related issues
          const keywordQueries = keywords.map(
            (keyword) => `summary ~ "${keyword}" OR description ~ "${keyword}"`
          );

          // Add project-specific searches for NeuralDocs
          const neuralDocsQueries = [
            `project = "SCRUM"`,
            `project = "HACKAHOLIC"`,
            `project = "LEARNJIRA"`,
          ];

          // Combine keyword search with project search
          const allQueries = [
            ...keywordQueries,
            ...neuralDocsQueries.map(
              (q) => `(${q} AND (${keywordQueries.join(" OR ")}))`
            ),
          ];

          jql = `(${allQueries.join(" OR ")}) ORDER BY updated DESC`;
        } else if (cleanQuery) {
          // Search with cleaned query
          jql = `summary ~ "${cleanQuery}" OR description ~ "${cleanQuery}" ORDER BY updated DESC`;
        } else {
          // Get all issues if no specific query
          jql = "ORDER BY updated DESC";
        }
      }

      console.log("Final JQL query:", jql);

      const response = await axios.post(
        `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`,
        {
          jql: jql,
          startAt: page * 20,
          maxResults: 20,
          fields: [
            "summary",
            "description",
            "status",
            "assignee",
            "created",
            "updated",
            "project",
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "JIRA search successful, found:",
        response.data.issues?.length || 0,
        "issues"
      );

      // Log sample issues if found
      if (response.data.issues && response.data.issues.length > 0) {
        console.log(
          "Sample JIRA issues:",
          response.data.issues.slice(0, 3).map((issue) => ({
            key: issue.key,
            summary: issue.fields.summary,
            project: issue.fields.project.name,
            projectKey: issue.fields.project.key,
          }))
        );
      }

      return {
        issues: response.data.issues || [],
        total: response.data.total,
        startAt: response.data.startAt,
        maxResults: response.data.maxResults,
      };
    } catch (error) {
      console.error(
        "Error searching JIRA issues:",
        error.response?.data || error.message
      );
      console.error("Full JIRA search error:", error);
      throw error;
    }
  }

  // Extract keywords from natural language query (similar to Google Drive)
  extractKeywords(query) {
    const queryLower = query.toLowerCase();

    // Remove common words that don't help with search
    const stopWords = [
      "do",
      "i",
      "have",
      "something",
      "related",
      "to",
      "in",
      "the",
      "google",
      "drive",
      "?",
      "what",
      "is",
      "are",
      "there",
      "any",
      "my",
      "files",
      "documents",
      "pdfs",
      "images",
      "show",
      "me",
      "find",
      "search",
      "for",
      "all",
      "of",
      "my",
      "that",
      "contains",
      "with",
      "about",
      "regarding",
      "concerning",
      "pertaining",
      "to",
      "our",
      "name",
      "for",
    ];

    // Extract meaningful words
    let words = queryLower
      .replace(/[^\w\s]/g, " ") // Remove punctuation
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.includes(word));

    // Add specific terms that might be in issue summaries
    const specificTerms = [];

    // NeuralDocs specific terms
    if (
      queryLower.includes("neural") ||
      queryLower.includes("docs") ||
      queryLower.includes("ai")
    ) {
      specificTerms.push(
        "neural",
        "docs",
        "ai",
        "search",
        "semantic",
        "document"
      );
    }

    if (queryLower.includes("jira") || queryLower.includes("dashboard")) {
      specificTerms.push("jira", "dashboard", "project", "issue");
    }
    if (queryLower.includes("bug") || queryLower.includes("issue")) {
      specificTerms.push("bug", "issue", "problem", "error");
    }
    if (queryLower.includes("feature") || queryLower.includes("story")) {
      specificTerms.push("feature", "story", "enhancement");
    }
    if (queryLower.includes("task") || queryLower.includes("todo")) {
      specificTerms.push("task", "todo", "work");
    }
    if (queryLower.includes("assigned") || queryLower.includes("me")) {
      specificTerms.push("assigned", "my", "personal", "user");
    }

    // Combine and deduplicate
    const allKeywords = [...new Set([...words, ...specificTerms])];
    console.log("Extracted keywords for JIRA:", allKeywords);

    return allKeywords;
  }

  // Get projects
  async getProjects(accessToken, cloudId) {
    try {
      const response = await axios.get(
        `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error getting JIRA projects:", error);
      throw error;
    }
  }

  // Get issue details
  async getIssue(accessToken, cloudId, issueKey) {
    try {
      const response = await axios.get(
        `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error getting JIRA issue:", error);
      throw error;
    }
  }

  // Get user info
  async getUserInfo(accessToken) {
    try {
      const response = await axios.get("https://api.atlassian.com/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error getting JIRA user info:", error);
      throw error;
    }
  }

  // Get accessible resources (cloud IDs)
  async getAccessibleResources(accessToken) {
    try {
      const response = await axios.get(
        "https://api.atlassian.com/oauth/token/accessible-resources",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error getting JIRA accessible resources:", error);
      throw error;
    }
  }

  // Extract assignee names from natural language query
  extractAssigneeNames(query) {
    const queryLower = query.toLowerCase();
    const assigneeNames = [];

    // Common name patterns - using exact JIRA assignee names
    const namePatterns = [
      "utsavi bagri", // Exact match for Utsavi
      "utsavi",
      "siddharthkumbharkar1503", // Exact JIRA name for Siddharth
      "siddharth kumbharkar",
      "siddhart kumbhakar",
      "asagrawal612", // Exact JIRA name for Aayush
      "aayush agrawal",
      "aayush",
      "bagri",
      "kumbhakar",
      "agrawal",
    ];

    namePatterns.forEach((name) => {
      if (queryLower.includes(name.toLowerCase())) {
        assigneeNames.push(name);
      }
    });

    return assigneeNames;
  }
}

export default JiraIntegration;
