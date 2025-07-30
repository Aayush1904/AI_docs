# Notion Access Guide: Internal Integration vs OAuth

## Overview

There are two ways to access Notion content through the API, each with different capabilities and limitations.

## 🔐 Internal Integration (Current Setup)

### How it works:

- Uses an **Internal Integration Secret** (starts with `secret_`)
- No user consent required
- **Limited access**: Only works with pages/databases explicitly shared with the integration

### Setup:

```bash
NOTION_INTERNAL_SECRET=secret_your_secret_here
NOTION_WORKSPACE_ID=your_workspace_id_here
```

### Limitations:

- ❌ **Cannot access all user documents**
- ❌ **Requires manual sharing** of each page/database
- ❌ **Limited to specific workspace**

### When to use:

- When you only need access to specific pages/databases
- For internal tools with controlled access
- When you want to limit the integration's scope

---

## 🔑 OAuth Integration (Recommended for Full Access)

### How it works:

- Uses **OAuth 2.0** flow
- Requires user consent
- **Full access**: Can search all user's pages and databases

### Setup:

```bash
NOTION_CLIENT_ID=your_client_id_here
NOTION_CLIENT_SECRET=your_client_secret_here
NOTION_REDIRECT_URI=http://localhost:3000/oauth-callback?source=notion
```

### Advantages:

- ✅ **Can access all user documents**
- ✅ **No manual sharing required**
- ✅ **Works across all user's workspaces**
- ✅ **User grants permission once**

### When to use:

- When you want to search all user's Notion content
- For personal knowledge management tools
- When you want seamless access without manual setup

---

## 🚀 Quick Setup for Full Access

### Step 1: Create OAuth Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Fill in details:
   - **Name**: "NeuralDocs Integration"
   - **Associated workspace**: Select your workspace
   - **Capabilities**: Enable all needed capabilities
4. Click "Submit"
5. Go to "OAuth & Permissions" in sidebar
6. Add redirect URL: `http://localhost:3000/oauth-callback?source=notion`
7. Copy **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

Replace your current Notion variables in `.env.local`:

```bash
# Remove these (if using internal integration)
# NOTION_INTERNAL_SECRET=...
# NOTION_WORKSPACE_ID=...

# Add these (for OAuth)
NOTION_CLIENT_ID=your_client_id_here
NOTION_CLIENT_SECRET=your_client_secret_here
NOTION_REDIRECT_URI=http://localhost:3000/oauth-callback?source=notion
```

### Step 3: Test the Integration

1. Restart your development server
2. Go to Knowledge Integration page
3. Click "Connect" on Notion
4. Complete the OAuth flow
5. Test search functionality

---

## 🔍 Why You're Getting 0 Results

### Current Issue:

Your integration is using an **Internal Integration Secret** but:

1. The secret might not be valid (doesn't start with `secret_`)
2. The integration hasn't been shared with any pages/databases
3. Even if shared, you can only access manually shared content

### Solution:

Switch to **OAuth** for full access to all your Notion content without manual sharing.

---

## 📊 Comparison Table

| Feature              | Internal Integration  | OAuth Integration |
| -------------------- | --------------------- | ----------------- |
| **Setup Complexity** | Simple                | Moderate          |
| **User Consent**     | None                  | Required          |
| **Access Scope**     | Manual sharing only   | All user content  |
| **Security**         | Limited by sharing    | User-controlled   |
| **Ease of Use**      | Requires manual setup | One-time setup    |
| **Recommended For**  | Controlled access     | Full access       |

---

## 🎯 Recommendation

**Use OAuth Integration** for the best user experience. It allows users to:

- Search all their Notion content
- No manual sharing required
- One-time setup per user
- Full access to their knowledge base

The current 0 results issue will be resolved once you switch to OAuth, as it will have access to all your Notion pages and databases automatically.
