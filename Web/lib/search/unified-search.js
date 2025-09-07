import GoogleDriveIntegration from "../integrations/google-drive.js";
import JiraIntegration from "../integrations/jira.js";
import NotionIntegration from "../integrations/notion.js";

class UnifiedSearchService {
  constructor() {
    this.googleDrive = new GoogleDriveIntegration();
    this.notion = new NotionIntegration();
    this.cache = new Map(); // Simple in-memory cache
    this.searchHistory = new Map(); // Track search history per user
  }

  // Perform unified search across all connected sources
  async searchAll(query, userIntegrations, userContext = {}) {
    console.log("Searching with query:", query);
    console.log("User integrations structure:", {
      keys: Object.keys(userIntegrations || {}),
      googleDrive: userIntegrations?.["google-drive"] ? "present" : "missing",
      jira: userIntegrations?.jira ? "present" : "missing",
      slack: userIntegrations?.slack ? "present" : "missing",
    });

    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(query, userIntegrations);
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 300000) {
        // 5 min cache
        console.log("Returning cached results");
        return cached.data;
      }

      // Detect the intended source from the query
      const queryLower = query.toLowerCase();
      const intendedSource = this.detectIntendedSource(queryLower);
      console.log("Detected intended source:", intendedSource);

      const results = {
        googleDrive: { issues: [], total: 0 },
        jira: { issues: [], total: 0 },
        notion: { pages: [], total: 0 },
        sources: [],
        total: 0,
      };

      let hasAuthErrors = false;
      const searchPromises = [];

      // Only search the intended source, not all sources
      if (intendedSource === "jira" || intendedSource === "all") {
        // Search JIRA if connected
        const jiraTokens = userIntegrations.jira;
        if (jiraTokens && jiraTokens.access_token && jiraTokens.cloudId) {
          searchPromises.push(
            this.searchJira(query, jiraTokens.access_token, jiraTokens.cloudId)
              .then((issues) => {
                results.jira = issues;
                results.sources.push("JIRA");
                results.total += issues.issues.length;

                // If no specific results found, try to get all issues to see what's available
                if (issues.issues.length === 0) {
                  console.log(
                    "No specific JIRA results found, trying to get all issues..."
                  );
                  return this.searchJira(
                    "",
                    jiraTokens.access_token,
                    jiraTokens.cloudId
                  );
                }
              })
              .then((allIssues) => {
                if (allIssues && allIssues.issues.length > 0) {
                  console.log(
                    "Found all JIRA issues:",
                    allIssues.issues.length
                  );
                  console.log("Available projects:", [
                    ...new Set(allIssues.issues.map((issue) => issue.project)),
                  ]);
                  console.log(
                    "Sample issues:",
                    allIssues.issues.slice(0, 3).map((issue) => ({
                      key: issue.id,
                      title: issue.title,
                      project: issue.project,
                    }))
                  );
                }
              })
              .catch((error) => {
                console.error("JIRA search error:", error);
                hasAuthErrors = true;
                // Return mock data for demonstration
                const mockJiraData = this.getMockJiraResults(query);
                results.jira = mockJiraData;
                results.sources.push("JIRA (Demo)");
                results.total += mockJiraData.issues.length;
              })
          );
        }
      }

      if (intendedSource === "google-drive" || intendedSource === "all") {
        // Search Google Drive if connected
        const googleDriveTokens =
          userIntegrations["google-drive"] || userIntegrations.googleDrive;
        console.log("Google Drive tokens check:", {
          hasGoogleDrive:
            !!userIntegrations["google-drive"] ||
            !!userIntegrations.googleDrive,
          hasAccessToken: !!(
            googleDriveTokens && googleDriveTokens.access_token
          ),
          tokens: googleDriveTokens ? Object.keys(googleDriveTokens) : "none",
        });

        if (googleDriveTokens && googleDriveTokens.access_token) {
          console.log("Starting Google Drive search...");
          searchPromises.push(
            this.searchGoogleDrive(query, googleDriveTokens.access_token)
              .then((files) => {
                console.log("Google Drive search completed successfully");
                results.googleDrive = files;
                results.sources.push("Google Drive");
                results.total += files.filesFound;
              })
              .catch((error) => {
                console.error("Google Drive search error:", error);
                hasAuthErrors = true;
                // Return mock data for demonstration
                const mockGoogleDriveData =
                  this.getMockGoogleDriveResults(query);
                results.googleDrive = mockGoogleDriveData;
                results.sources.push("Google Drive (Demo)");
                results.total += mockGoogleDriveData.filesFound;
              })
          );
        } else {
          console.log("Google Drive not connected or no access token");
        }
      }

      if (intendedSource === "notion" || intendedSource === "all") {
        // Search Notion if connected
        const notionTokens = userIntegrations.notion;
        console.log("Notion tokens check:", {
          hasNotion: !!userIntegrations.notion,
          hasAccessToken: !!(notionTokens && notionTokens.access_token),
          tokens: notionTokens ? Object.keys(notionTokens) : "none",
        });

        if (notionTokens && notionTokens.access_token) {
          console.log("Starting Notion search...");
          searchPromises.push(
            this.searchNotion(query, notionTokens.access_token)
              .then((pages) => {
                console.log("Notion search completed successfully");
                results.notion = pages;
                results.sources.push("Notion");
                results.total += pages.pagesFound;
              })
              .catch((error) => {
                console.error("Notion search error:", error);
                hasAuthErrors = true;
                // Return mock data for demonstration
                const mockNotionData = this.getMockNotionResults(query);
                results.notion = mockNotionData;
                results.sources.push("Notion (Demo)");
                results.total += mockNotionData.pagesFound;
              })
          );
        } else {
          console.log("Notion not connected or no access token");
        }
      }

      // Wait for all searches to complete
      await Promise.all(searchPromises);

      // Normalize and format results
      const formattedResults = this.formatResults(results, query);

      // Add demo notice if there were auth errors
      if (hasAuthErrors) {
        formattedResults.demo = true;
        formattedResults.message =
          "Showing demo results due to authentication issues. Please reconnect your integrations for live data.";
      }

      // Cache the results
      this.cache.set(cacheKey, {
        data: formattedResults,
        timestamp: Date.now(),
      });

      return formattedResults;
    } catch (error) {
      console.error("Search error:", error);
      return {
        results: [],
        total: 0,
        sources: [],
        query: query,
        error: "Search failed. Please try again.",
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Search Google Drive
  async searchGoogleDrive(query, accessToken) {
    let credentials;
    if (typeof accessToken === "string") {
      credentials = { access_token: accessToken };
    } else {
      credentials = accessToken;
    }

    console.log("Setting Google Drive credentials for search:", credentials);
    this.googleDrive.setCredentials(credentials);
    const result = await this.googleDrive.searchFiles(query);

    console.log("Google Drive search result:", {
      query: query,
      filesFound: result.files.length,
      sampleFiles: result.files.slice(0, 3).map((f) => f.name),
    });

    // Return the correct structure that searchAll expects
    return {
      files: result.files.map((file) => ({
        id: file.id,
        title: file.name,
        source: "Google Drive",
        type: "file",
        mimeType: file.mimeType,
        url: file.webViewLink,
        modifiedTime: file.modifiedTime,
        size: file.size,
        snippet: `File: ${file.name}`,
        icon: this.getFileIcon(file.mimeType),
      })),
      filesFound: result.files.length,
      nextPageToken: result.nextPageToken,
    };
  }

  // Search JIRA
  async searchJira(query, accessToken, cloudId) {
    try {
      console.log("Searching JIRA issues...");
      console.log("Query:", query);
      console.log("Cloud ID:", cloudId);
      console.log("Access token present:", !!accessToken);

      const jiraIntegration = new JiraIntegration();
      const result = await jiraIntegration.searchIssues(
        query,
        accessToken,
        cloudId
      );

      console.log(
        "JIRA search successful, found:",
        result.issues?.length || 0,
        "issues"
      );

      // Log sample issues if found
      if (result.issues && result.issues.length > 0) {
        console.log(
          "Sample JIRA issues:",
          result.issues.slice(0, 3).map((issue) => ({
            key: issue.key,
            summary: issue.fields.summary,
            project: issue.fields.project.name,
            projectKey: issue.fields.project.key,
            assignee: issue.fields.assignee?.displayName || "Unassigned",
            status: issue.fields.status?.name || "Unknown",
          }))
        );
      }

      return {
        issues: result.issues.map((issue) => ({
          id: issue.key,
          title: issue.fields.summary,
          source: "JIRA",
          type: "issue",
          project: issue.fields.project.name,
          projectKey: issue.fields.project.key,
          organization: "NeuralDocs", // Add organization name
          status: issue.fields.status?.name || "Unknown",
          assignee: issue.fields.assignee?.displayName || "Unassigned",
          url: `https://neuraldocss.atlassian.net/browse/${issue.key}`,
          created: issue.fields.created,
          updated: issue.fields.updated,
          snippet:
            typeof issue.fields.description === "string"
              ? issue.fields.description
              : issue.fields.description?.content ||
                issue.fields.summary ||
                "No description available",
          icon: "calendar",
          category: "issues",
        })),
        total: result.total,
        startAt: result.startAt,
        maxResults: result.maxResults,
      };
    } catch (error) {
      console.error("Error searching JIRA:", error);
      throw error;
    }
  }

  // Search Notion
  async searchNotion(query, accessToken) {
    try {
      console.log("Searching Notion pages...");
      console.log("Query:", query);
      console.log("Access token present:", !!accessToken);

      const result = await this.notion.searchPages(query, accessToken);

      console.log("Notion search result:", {
        query: query,
        pagesFound: result.pages.length,
        samplePages: result.pages
          .slice(0, 3)
          .map(
            (p) =>
              p.properties?.title?.title?.[0]?.plain_text ||
              p.properties?.Name?.title?.[0]?.plain_text ||
              "Untitled"
          ),
      });

      return {
        pages: result.pages.map((item) => ({
          id: item.id,
          title: this.extractNotionTitle(item),
          source: "Notion",
          type: item.object === "database" ? "database" : "page",
          workspace: "Notion Workspace",
          url: item.url,
          created: item.created_time,
          updated: item.last_edited_time,
          snippet: this.extractPageSnippet(item),
          icon: item.object === "database" ? "database" : "file-text",
          category: item.object === "database" ? "databases" : "pages",
        })),
        pagesFound: result.pages.length,
        total: result.total,
        hasMore: result.hasMore,
      };
    } catch (error) {
      console.error("Error searching Notion:", error);
      throw error;
    }
  }

  // Format and normalize results
  formatResults(results, query) {
    console.log(
      "Formatting results - Google Drive:",
      results.googleDrive?.filesFound || 0
    );
    console.log(
      "Formatting results - JIRA:",
      results.jira?.issues?.length || 0
    );
    console.log(
      "Formatting results - Notion:",
      results.notion?.pagesFound || 0
    );

    const allResults = [];

    // Add Google Drive results
    if (
      results.googleDrive &&
      results.googleDrive.files &&
      Array.isArray(results.googleDrive.files)
    ) {
      console.log(
        "Processing Google Drive files:",
        results.googleDrive.files.length
      );
      results.googleDrive.files.forEach((file) => {
        const relevance = this.calculateRelevance(file, query);
        console.log(
          `Added Google Drive file: ${file.title} with relevance: ${relevance}`
        );
        allResults.push({
          ...file,
          relevance: relevance,
        });
      });
    }

    // Add JIRA results
    if (
      results.jira &&
      results.jira.issues &&
      Array.isArray(results.jira.issues)
    ) {
      console.log("Processing JIRA issues:", results.jira.issues.length);
      results.jira.issues.forEach((issue) => {
        const relevance = this.calculateRelevance(issue, query);
        console.log(
          `Added JIRA issue: ${issue.title} with relevance: ${relevance}`
        );
        allResults.push({
          ...issue,
          relevance: relevance,
        });
      });
    }

    // Add Notion results
    if (
      results.notion &&
      results.notion.pages &&
      Array.isArray(results.notion.pages)
    ) {
      console.log("Processing Notion pages:", results.notion.pages.length);
      results.notion.pages.forEach((page) => {
        const relevance = this.calculateRelevance(page, query);
        console.log(
          `Added Notion page: ${page.title} with relevance: ${relevance}`
        );
        allResults.push({
          ...page,
          relevance: relevance,
        });
      });
    }

    // Sort by relevance score
    allResults.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    return {
      results: allResults,
      total: allResults.length,
      sources: results.sources,
      query: query,
      timestamp: new Date().toISOString(),
    };
  }

  // Calculate relevance score
  calculateRelevance(item, query) {
    const queryLower = query.toLowerCase();
    const titleLower = item.title.toLowerCase();
    const snippetLower = (item.snippet || "").toString().toLowerCase(); // Fixed TypeError here

    let score = 0;

    // Extract keywords from the query
    const keywords = this.extractKeywordsFromQuery(query);

    // Check for exact matches in title
    if (titleLower === queryLower) {
      score += 50; // Highest priority for exact matches
    }

    // Check for keyword matches in title
    keywords.forEach((keyword) => {
      if (titleLower.includes(keyword.toLowerCase())) {
        score += 20; // High priority for keyword matches in title
      }
    });

    // Check for partial matches in title
    if (titleLower.includes(queryLower)) {
      score += 15;
    }

    // Check for keyword matches in snippet
    keywords.forEach((keyword) => {
      if (snippetLower.includes(keyword.toLowerCase())) {
        score += 10; // Medium priority for keyword matches in snippet
      }
    });

    // Check for partial matches in snippet
    if (snippetLower.includes(queryLower)) {
      score += 5;
    }

    // Bonus for specific file types mentioned in query
    if (queryLower.includes("pdf") && item.mimeType?.includes("pdf")) {
      score += 10;
    }
    if (queryLower.includes("image") && item.mimeType?.includes("image")) {
      score += 10;
    }
    if (queryLower.includes("video") && item.mimeType?.includes("video")) {
      score += 10;
    }

    // Recent items get bonus
    if (item.modifiedTime || item.timestamp || item.updated) {
      const date = new Date(
        item.modifiedTime || item.timestamp || item.updated
      );
      const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      if (daysAgo < 7) score += 3;
      if (daysAgo < 30) score += 1;
    }

    // Bonus for files that match the source context
    if (queryLower.includes("offer") && titleLower.includes("offer")) {
      score += 15;
    }
    if (queryLower.includes("letter") && titleLower.includes("letter")) {
      score += 15;
    }
    if (queryLower.includes("plasma") && titleLower.includes("plasma")) {
      score += 15;
    }
    if (queryLower.includes("resume") && titleLower.includes("resume")) {
      score += 15;
    }

    // Bonus for JIRA issues when query is about JIRA
    if (queryLower.includes("jira") && item.source === "JIRA") {
      score += 25; // High priority for JIRA queries
    }
    if (queryLower.includes("dashboard") && item.source === "JIRA") {
      score += 20;
    }
    if (queryLower.includes("task") && item.source === "JIRA") {
      score += 20;
    }
    if (queryLower.includes("issue") && item.source === "JIRA") {
      score += 20;
    }

    // Bonus for specific assignee names in JIRA
    if (item.source === "JIRA" && item.assignee) {
      const assigneeLower = item.assignee.toLowerCase();
      if (queryLower.includes("utsavi") && assigneeLower.includes("utsavi")) {
        score += 50; // High priority for specific assignee
      }
      if (
        queryLower.includes("siddharth") &&
        assigneeLower.includes("siddharth")
      ) {
        score += 50;
      }
      if (queryLower.includes("aayush") && assigneeLower.includes("aayush")) {
        score += 50;
      }
      if (queryLower.includes("bagri") && assigneeLower.includes("bagri")) {
        score += 50;
      }
      if (
        queryLower.includes("kumbhakar") &&
        assigneeLower.includes("kumbhakar")
      ) {
        score += 50;
      }
    }

    // Bonus for organization queries
    if (
      queryLower.includes("organisation") ||
      queryLower.includes("organization")
    ) {
      if (
        item.source === "JIRA" &&
        item.project &&
        item.project.includes("Neural Docs")
      ) {
        score += 40; // High priority for organization queries
      }
    }

    return score;
  }

  // Extract keywords from natural language query
  extractKeywordsFromQuery(query) {
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
    ];

    // Extract meaningful words
    let words = queryLower
      .replace(/[^\w\s]/g, " ") // Remove punctuation
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.includes(word));

    // Add specific terms that might be in file names
    const specificTerms = [];
    if (queryLower.includes("offer") || queryLower.includes("letter")) {
      specificTerms.push("offer", "letter");
    }
    if (queryLower.includes("resume") || queryLower.includes("cv")) {
      specificTerms.push("resume", "cv");
    }
    if (queryLower.includes("plasma") || queryLower.includes("tech")) {
      specificTerms.push("plasma", "tech");
    }
    if (queryLower.includes("web") || queryLower.includes("development")) {
      specificTerms.push("web", "development");
    }
    if (queryLower.includes("food") || queryLower.includes("recipe")) {
      specificTerms.push("food", "recipe");
    }

    // Combine and deduplicate
    const allKeywords = [...new Set([...words, ...specificTerms])];

    return allKeywords;
  }

  // Generate cache key for search results
  generateCacheKey(query, userIntegrations) {
    const integrations = Object.keys(userIntegrations || {})
      .sort()
      .join(",");
    return `${query.toLowerCase().trim()}_${integrations}`;
  }

  // Get file icon based on MIME type
  getFileIcon(mimeType) {
    if (!mimeType) return "file";

    if (mimeType.includes("pdf")) return "file-text";
    if (mimeType.includes("image")) return "image";
    if (mimeType.includes("video")) return "video";
    if (mimeType.includes("audio")) return "music";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return "table";
    if (mimeType.includes("document") || mimeType.includes("word"))
      return "file-text";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
      return "presentation";

    return "file";
  }

  // Mock data for Google Drive
  getMockGoogleDriveResults(query) {
    console.log("Returning mock Google Drive results for query:", query);
    return [
      {
        id: "12345",
        title: "Mock Document.pdf",
        source: "Google Drive (Demo)",
        type: "file",
        mimeType: "application/pdf",
        url: "https://example.com/mock-file",
        modifiedTime: "2023-01-01T10:00:00Z",
        size: 12345,
        snippet: "This is a mock document for testing.",
        icon: "file-text",
      },
      {
        id: "67890",
        title: "Mock Image.jpg",
        source: "Google Drive (Demo)",
        type: "file",
        mimeType: "image/jpeg",
        url: "https://example.com/mock-image",
        modifiedTime: "2023-02-15T14:30:00Z",
        size: 5678,
        snippet: "This is a mock image for testing.",
        icon: "image",
      },
    ];
  }

  // Mock data for JIRA
  getMockJiraResults(query) {
    console.log("Returning mock JIRA results for query:", query);
    return {
      issues: [
        {
          id: "MOCK-1",
          title: "Mock Issue 1",
          source: "JIRA (Demo)",
          type: "issue",
          project: "Demo Project",
          status: "Open",
          assignee: "Mock User",
          url: "https://example.com/mock-jira",
          created: "2023-03-01T08:00:00Z",
          updated: "2023-03-01T08:00:00Z",
          snippet: "This is a mock issue for testing.",
          icon: "calendar",
        },
        {
          id: "MOCK-2",
          title: "Mock Issue 2",
          source: "JIRA (Demo)",
          type: "issue",
          project: "Demo Project",
          status: "Closed",
          assignee: "Another Mock User",
          url: "https://example.com/mock-jira2",
          created: "2023-03-02T09:00:00Z",
          updated: "2023-03-02T09:00:00Z",
          snippet: "This is another mock issue for testing.",
          icon: "calendar",
        },
      ],
      total: 2, // Total count for mock data
    };
  }

  // Mock data for Notion
  getMockNotionResults(query) {
    console.log("Returning mock Notion results for query:", query);
    return {
      pages: [
        {
          id: "page123",
          title: "NeuralDocs Project Overview",
          source: "Notion (Demo)",
          type: "page",
          workspace: "NeuralDocs Workspace",
          url: "https://example.com/mock-notion-page",
          created: "2023-03-01T08:00:00Z",
          updated: "2023-03-01T08:00:00Z",
          snippet:
            "This is a mock Notion page about the NeuralDocs project overview and architecture.",
          icon: "file-text",
          category: "pages",
        },
        {
          id: "page456",
          title: "API Documentation",
          source: "Notion (Demo)",
          type: "page",
          workspace: "NeuralDocs Workspace",
          url: "https://example.com/mock-notion-api-docs",
          created: "2023-03-02T09:00:00Z",
          updated: "2023-03-02T09:00:00Z",
          snippet:
            "Complete API documentation for the NeuralDocs search engine and integrations.",
          icon: "file-text",
          category: "pages",
        },
        {
          id: "page789",
          title: "Team Meeting Notes",
          source: "Notion (Demo)",
          type: "page",
          workspace: "NeuralDocs Workspace",
          url: "https://example.com/mock-notion-meeting-notes",
          created: "2023-03-03T10:00:00Z",
          updated: "2023-03-03T10:00:00Z",
          snippet:
            "Meeting notes from the latest team discussion about project milestones and next steps.",
          icon: "file-text",
          category: "pages",
        },
      ],
      pagesFound: 3,
    };
  }

  // Extract title from Notion page or database
  extractNotionTitle(item) {
    if (item.object === "database") {
      return (
        item.title?.[0]?.plain_text ||
        item.properties?.Name?.title?.[0]?.plain_text ||
        "Untitled Database"
      );
    }

    return (
      item.properties?.title?.title?.[0]?.plain_text ||
      item.properties?.Name?.title?.[0]?.plain_text ||
      "Untitled"
    );
  }

  // Extract snippet from Notion page or database
  extractPageSnippet(item) {
    if (item.object === "database") {
      const title =
        item.title?.[0]?.plain_text ||
        item.properties?.Name?.title?.[0]?.plain_text ||
        "";

      const description = item.description?.[0]?.plain_text || "";

      return title
        ? `${title}${description ? ` - ${description}` : ""}`
        : "Notion database";
    }

    // For pages, try to extract content from various Notion page properties
    const title =
      item.properties?.title?.title?.[0]?.plain_text ||
      item.properties?.Name?.title?.[0]?.plain_text ||
      "";

    const description =
      item.properties?.Description?.rich_text?.[0]?.plain_text ||
      item.properties?.description?.rich_text?.[0]?.plain_text ||
      "";

    const tags =
      item.properties?.Tags?.multi_select?.map((tag) => tag.name).join(", ") ||
      item.properties?.tags?.multi_select?.map((tag) => tag.name).join(", ") ||
      "";

    // Combine available information
    const parts = [title, description, tags].filter(Boolean);
    return parts.length > 0 ? parts.join(" - ") : "Notion page";
  }

  // Detect which source the user is asking about
  detectIntendedSource(query) {
    const queryLower = query.toLowerCase();

    // JIRA-specific keywords
    const jiraKeywords = [
      "jira",
      "issue",
      "bug",
      "task",
      "story",
      "epic",
      "sprint",
      "board",
      "dashboard",
      "project",
      "assignee",
      "reporter",
      "status",
      "priority",
      "backlog",
      "kanban",
      "scrum",
      "agile",
      "workflow",
      "ticket",
    ];

    // Google Drive-specific keywords
    const googleDriveKeywords = [
      "drive",
      "file",
      "document",
      "pdf",
      "doc",
      "docx",
      "spreadsheet",
      "presentation",
      "folder",
      "upload",
      "download",
      "share",
      "permission",
      "google docs",
      "google sheets",
      "google slides",
      "gmail",
      "attachment",
    ];

    // Notion-specific keywords
    const notionKeywords = [
      "notion",
      "page",
      "database",
      "workspace",
      "block",
      "template",
      "wiki",
      "knowledge",
      "notes",
      "documentation",
    ];

    // Count matches for each source
    let jiraScore = 0;
    let googleDriveScore = 0;
    let notionScore = 0;

    jiraKeywords.forEach((keyword) => {
      if (queryLower.includes(keyword)) jiraScore++;
    });

    googleDriveKeywords.forEach((keyword) => {
      if (queryLower.includes(keyword)) googleDriveScore++;
    });

    notionKeywords.forEach((keyword) => {
      if (queryLower.includes(keyword)) notionScore++;
    });

    // Determine the intended source
    const maxScore = Math.max(jiraScore, googleDriveScore, notionScore);

    if (maxScore === 0) {
      return "all"; // If no specific source detected, search all
    }

    if (jiraScore === maxScore) {
      return "jira";
    } else if (googleDriveScore === maxScore) {
      return "google-drive";
    } else if (notionScore === maxScore) {
      return "notion";
    }

    return "all";
  }
}

export default UnifiedSearchService;
