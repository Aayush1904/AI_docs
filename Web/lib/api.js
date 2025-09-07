/**
 * Centralized API configuration for the application
 * Handles both backend server endpoints and Next.js API routes
 */

// Base URL for backend server (Express.js)
const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

// Base URL for Next.js API routes (relative to current domain)
const NEXT_API_URL = process.env.NEXT_PUBLIC_NEXT_API_URL || "";

/**
 * API configuration object
 */
export const api = {
  // Backend server endpoints (Express.js)
  backend: {
    baseURL: BACKEND_API_URL,

    // Project endpoints
    projects: {
      getAll: () => `${BACKEND_API_URL}/api/projects/getProjects`,
      create: () => `${BACKEND_API_URL}/api/projects/create`,
      getCommits: (projectId) =>
        `${BACKEND_API_URL}/api/projects/commits/${projectId}`,
      saveAnswer: (projectId) =>
        `${BACKEND_API_URL}/api/projects/saveAnswer/${projectId}`,
      getQuestions: (projectId) =>
        `${BACKEND_API_URL}/api/projects/questions/${projectId}`,
    },

    // Comment endpoints
    comments: {
      get: (commitId) => `${BACKEND_API_URL}/api/comments?commitId=${commitId}`,
      create: () => `${BACKEND_API_URL}/api/comments`,
    },
  },

  // Next.js API routes
  next: {
    baseURL: NEXT_API_URL,

    // Document endpoints
    documents: {
      getAll: () => `${NEXT_API_URL}/api/documents`,
      upload: () => `${NEXT_API_URL}/api/documents/upload`,
      process: () => `${NEXT_API_URL}/api/process-documents`,
    },

    // Search endpoints
    search: {
      semantic: () => `${NEXT_API_URL}/api/semantic-search`,
      aiProcess: () => `${NEXT_API_URL}/api/ai-process`,
    },

    // AI endpoints
    ai: {
      generateReadme: () => `${NEXT_API_URL}/api/generate-readme`,
      generateApiDocs: () => `${NEXT_API_URL}/api/generate-api-docs`,
      generateCodeComments: () => `${NEXT_API_URL}/api/generate-code-comments`,
      generateFileSummary: () => `${NEXT_API_URL}/api/generate-file-summary`,
    },

    // Integration endpoints
    integrations: {
      auth: () => `${NEXT_API_URL}/api/integrations/auth`,
      search: () => `${NEXT_API_URL}/api/integrations/search`,
      debug: () => `${NEXT_API_URL}/api/integrations/debug`,
    },
  },

  // Utility functions
  utils: {
    // Get full URL for any endpoint
    getUrl: (endpoint) => {
      if (endpoint.startsWith("http")) {
        return endpoint; // Already a full URL
      }
      if (endpoint.startsWith("/api/")) {
        return `${NEXT_API_URL}${endpoint}`; // Next.js API route
      }
      return `${BACKEND_API_URL}${endpoint}`; // Backend server endpoint
    },

    // Check if URL is backend server
    isBackendUrl: (url) => {
      return url.startsWith(BACKEND_API_URL);
    },

    // Check if URL is Next.js API route
    isNextApiUrl: (url) => {
      return url.startsWith(NEXT_API_URL) && url.includes("/api/");
    },
  },
};

/**
 * Default fetch configuration
 */
export const fetchConfig = {
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // Include cookies for authentication
};

/**
 * Enhanced fetch function with error handling
 */
export const apiFetch = async (url, options = {}) => {
  const config = {
    ...fetchConfig,
    ...options,
    headers: {
      ...fetchConfig.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API fetch error:", error);
    throw error;
  }
};

/**
 * Axios instance for backend API calls
 */
export const backendApi = {
  baseURL: BACKEND_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

export default api;
