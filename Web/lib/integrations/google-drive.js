import { google } from "googleapis";

class GoogleDriveIntegration {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Generate OAuth URL for Google Drive
  generateAuthUrl() {
    const scopes = [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });
  }

  // Exchange code for tokens
  async getTokensFromCode(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error("Error getting tokens:", error);
      throw error;
    }
  }

  // Set credentials from stored tokens
  setCredentials(tokens) {
    console.log("Setting Google Drive credentials:", tokens);
    console.log("OAuth2 client config:", {
      clientId: process.env.GOOGLE_CLIENT_ID ? "set" : "missing",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "set" : "missing",
      redirectUri: process.env.GOOGLE_REDIRECT_URI ? "set" : "missing",
    });

    // Ensure we have the required environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error("Google OAuth environment variables not configured");
    }

    // Create a new OAuth2 client instance with proper configuration
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set the credentials
    this.oauth2Client.setCredentials(tokens);

    // Verify credentials were set
    const credentials = this.oauth2Client.credentials;
    console.log("OAuth2 client credentials after setting:", {
      access_token: credentials.access_token ? "present" : "missing",
      refresh_token: credentials.refresh_token ? "present" : "missing",
      expiry_date: credentials.expiry_date ? "present" : "missing",
    });

    // Set up automatic token refresh
    this.oauth2Client.on("tokens", (tokens) => {
      console.log("Tokens refreshed:", tokens);
      // You could save the new tokens here
    });
  }

  // Search files in Google Drive
  async searchFiles(query, pageToken = null) {
    try {
      const drive = google.drive({ version: "v3", auth: this.oauth2Client });

      // Extract keywords from natural language query
      const keywords = this.extractKeywords(query);
      console.log("Extracted keywords:", keywords);

      // More comprehensive search query - try different approaches
      let searchQuery;

      // Always try to search for the user's query first
      // If no results found, then fall back to listing all files
      const queryLower = query.toLowerCase();

      // Check if this looks like a general "show me everything" type query
      const generalIndicators = [
        "all",
        "everything",
        "what all",
        "show all",
        "list all",
        "all files",
        "all documents",
        "all pdfs",
        "all the files",
        "files in my drive",
        "my drive files",
        "google drive files",
      ];

      const isGeneralQuery = generalIndicators.some((indicator) =>
        queryLower.includes(indicator)
      );

      if (isGeneralQuery) {
        // For general queries, list all files
        searchQuery = "trashed = false";
      } else {
        // For specific searches, try multiple search strategies
        const searchQueries = [];

        // 1. Search with extracted keywords (PRIORITY)
        if (keywords.length > 0) {
          const keywordQueries = keywords.map(
            (keyword) =>
              `(name contains '${keyword}' or fullText contains '${keyword}')`
          );
          searchQueries.push(
            `(${keywordQueries.join(" or ")}) and trashed = false`
          );
        }

        // 2. Search with original query (fallback)
        searchQueries.push(
          `(name contains '${query}' or fullText contains '${query}') and trashed = false`
        );

        // 3. Search for specific file types if mentioned
        if (queryLower.includes("pdf") || queryLower.includes("document")) {
          searchQueries.push(`mimeType contains 'pdf' and trashed = false`);
        }
        if (
          queryLower.includes("image") ||
          queryLower.includes("photo") ||
          queryLower.includes("picture")
        ) {
          searchQueries.push(`mimeType contains 'image' and trashed = false`);
        }
        if (queryLower.includes("video")) {
          searchQueries.push(`mimeType contains 'video' and trashed = false`);
        }

        // Use the keyword search first, then fallback to original query
        searchQuery = searchQueries[0];
      }

      console.log("Searching Google Drive with query:", searchQuery);
      console.log("Keywords extracted:", keywords);
      console.log("Query type:", isGeneralQuery ? "General" : "Specific");

      const response = await drive.files.list({
        q: searchQuery,
        fields:
          "nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, description)",
        pageSize: 50, // Increased to get more results
        pageToken: pageToken,
        // Include all file types
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        orderBy: "modifiedTime desc", // Show most recent first
      });

      const files = response.data.files || [];
      console.log("Google Drive search results:", files.length, "files found");

      // Log the first few file names to see what we're getting
      if (files.length > 0) {
        console.log(
          "Sample files found:",
          files.slice(0, 5).map((f) => f.name)
        );
      }

      // If no results and it wasn't a general query, try a broader search
      if (files.length === 0 && !isGeneralQuery) {
        console.log("No results found, trying broader search...");

        // Try searching with keywords
        if (keywords.length > 0) {
          const keywordSearchQuery = `(${keywords
            .map((k) => `name contains '${k}'`)
            .join(" or ")}) and trashed = false`;
          console.log("Trying keyword search:", keywordSearchQuery);

          const keywordResponse = await drive.files.list({
            q: keywordSearchQuery,
            fields:
              "nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, description)",
            pageSize: 50,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
            orderBy: "modifiedTime desc",
          });

          const keywordFiles = keywordResponse.data.files || [];
          console.log("Keyword search found:", keywordFiles.length, "files");

          if (keywordFiles.length > 0) {
            return {
              files: keywordFiles,
              nextPageToken: keywordResponse.data.nextPageToken,
            };
          }
        }

        // Try searching just in names
        const nameSearchQuery = `name contains '${query}' and trashed = false`;
        const nameResponse = await drive.files.list({
          q: nameSearchQuery,
          fields:
            "nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, description)",
          pageSize: 50,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
          orderBy: "modifiedTime desc",
        });

        const nameFiles = nameResponse.data.files || [];
        console.log("Name-only search found:", nameFiles.length, "files");

        if (nameFiles.length > 0) {
          return {
            files: nameFiles,
            nextPageToken: nameResponse.data.nextPageToken,
          };
        }
      }

      return {
        files: files,
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error) {
      console.error("Error searching Google Drive:", error);
      throw error;
    }
  }

  // Extract keywords from natural language query
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
    ];

    // Extract meaningful words
    let words = queryLower
      .replace(/[^\w\s]/g, " ") // Remove punctuation
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.includes(word));

    // Add specific terms that might be in file names
    const specificTerms = [];

    // Handle offer letter queries
    if (queryLower.includes("offer") || queryLower.includes("letter")) {
      specificTerms.push("offer", "letter", "plasma", "tech");
      // Also add common variations
      if (queryLower.includes("plasma")) {
        specificTerms.push("plasma");
      }
      if (queryLower.includes("tech")) {
        specificTerms.push("tech");
      }
    }

    // Handle resume queries
    if (queryLower.includes("resume") || queryLower.includes("cv")) {
      specificTerms.push("resume", "cv");
    }

    // Handle web development queries
    if (queryLower.includes("web") || queryLower.includes("development")) {
      specificTerms.push(
        "web",
        "development",
        "html",
        "css",
        "javascript",
        "react",
        "node"
      );
    }

    // Handle food queries
    if (queryLower.includes("food") || queryLower.includes("recipe")) {
      specificTerms.push("food", "recipe", "cooking");
    }

    // Handle PDF queries
    if (queryLower.includes("pdf") || queryLower.includes("document")) {
      specificTerms.push("pdf", "document");
    }

    // Handle image queries
    if (
      queryLower.includes("image") ||
      queryLower.includes("photo") ||
      queryLower.includes("picture")
    ) {
      specificTerms.push("image", "photo", "picture", "jpg", "png");
    }

    // Combine and deduplicate
    const allKeywords = [...new Set([...words, ...specificTerms])];
    console.log("Extracted keywords from query:", allKeywords);

    return allKeywords;
  }

  // Get file content
  async getFileContent(fileId) {
    try {
      const drive = google.drive({ version: "v3", auth: this.oauth2Client });

      const response = await drive.files.get({
        fileId: fileId,
        alt: "media",
      });

      return response.data;
    } catch (error) {
      console.error("Error getting file content:", error);
      throw error;
    }
  }

  // Get user info
  async getUserInfo() {
    try {
      console.log("Getting user info with credentials:", {
        access_token: this.oauth2Client.credentials.access_token
          ? "present"
          : "missing",
        refresh_token: this.oauth2Client.credentials.refresh_token
          ? "present"
          : "missing",
      });

      console.log("OAuth2 client instance:", {
        hasClient: !!this.oauth2Client,
        clientId: this.oauth2Client._clientId ? "present" : "missing",
        credentials: this.oauth2Client.credentials,
      });

      const oauth2 = google.oauth2({ version: "v2", auth: this.oauth2Client });
      const response = await oauth2.userinfo.get();
      return response.data;
    } catch (error) {
      console.error("Error getting user info:", error);
      console.error("OAuth2 client state:", {
        credentials: this.oauth2Client.credentials,
        clientId: process.env.GOOGLE_CLIENT_ID ? "set" : "missing",
      });
      throw error;
    }
  }

  // List all files (for debugging)
  async listAllFiles(pageToken = null) {
    try {
      const drive = google.drive({ version: "v3", auth: this.oauth2Client });

      const response = await drive.files.list({
        fields:
          "nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink)",
        pageSize: 50,
        pageToken: pageToken,
        // Include all file types
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        // Only show files that aren't trashed
        q: "trashed = false",
      });

      console.log(
        "All Google Drive files:",
        response.data.files?.length || 0,
        "files found"
      );
      return {
        files: response.data.files || [],
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error) {
      console.error("Error listing Google Drive files:", error);
      throw error;
    }
  }
}

export default GoogleDriveIntegration;
