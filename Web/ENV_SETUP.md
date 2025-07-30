# Environment Setup for Multi-Source Knowledge Integration

This guide will help you set up the required environment variables for the real integrations.

## Required Environment Variables

Create a `.env.local` file in the root of your Web directory with the following variables:

### Google Drive OAuth

```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth-callback?source=google-drive
```

### Slack OAuth

```bash
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here
SLACK_REDIRECT_URI=http://localhost:3000/oauth-callback?source=slack
```

### JIRA OAuth

```bash
JIRA_CLIENT_ID=your_jira_client_id_here
JIRA_CLIENT_SECRET=your_jira_client_secret_here
JIRA_REDIRECT_URI=http://localhost:3000/oauth-callback?source=jira
```

### Notion Integration (Choose One)

**Option 1: Internal Integration (Limited Access)**

```bash
NOTION_INTERNAL_SECRET=your_notion_internal_secret_here
NOTION_WORKSPACE_ID=your_notion_workspace_id_here
```

**Option 2: OAuth Integration (Full Access)**

```bash
NOTION_CLIENT_ID=your_notion_client_id_here
NOTION_CLIENT_SECRET=your_notion_client_secret_here
NOTION_REDIRECT_URI=http://localhost:3000/oauth-callback?source=notion
```

## How to Get OAuth Credentials

### Google Drive Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/oauth-callback?source=google-drive`
   - `http://localhost:3000/oauth-callback`
7. Copy the Client ID and Client Secret

### Slack Setup

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Give your app a name and select your workspace
4. Go to "OAuth & Permissions" in the sidebar
5. Add the following scopes:
   - `channels:read`
   - `channels:history`
   - `groups:read`
   - `groups:history`
   - `im:read`
   - `im:history`
   - `mpim:read`
   - `mpim:history`
   - `files:read`
   - `users:read`
6. Add redirect URL: `http://localhost:3000/oauth-callback?source=slack`
7. Install the app to your workspace
8. Copy the Client ID and Client Secret

### JIRA Setup

1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Click "Create" → "Create app"
3. Choose "OAuth 2.0 (3LO)" as the app type
4. Fill in the app details:
   - **App name**: Your app name (e.g., "Knowledge Integration")
   - **App logo**: Upload a logo (optional)
   - **App description**: Brief description of your app
5. Go to "Authorization" in the left sidebar
6. Add these **OAuth 2.0 scopes**:
   - `read:jira-work`
   - `read:jira-user`
   - `read:jira:jira`
   - `read:issue:jira`
   - `read:project:jira`
   - `read:board:jira-agile`
   - `read:jira-user:jira`
7. Add **Redirect URLs**:
   - `http://localhost:3000/oauth-callback?source=jira`
8. Go to "Settings" → "App details"
9. Copy the **Client ID** and **Client Secret**
10. **Important**: Make sure your app is **approved** or you're using it in a development environment

### Notion Integration Setup

#### Option 1: Internal Integration (Limited Access)

1. Go to [Notion Developers](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Fill in the integration details:
   - **Name**: Your integration name (e.g., "NeuralDocs Integration")
   - **Associated workspace**: Select your workspace
   - **Capabilities**: Enable the capabilities you need:
     - Read content
     - Update content
     - Insert content
     - Read comments
     - Insert comments
4. Click "Submit"
5. Copy the **Internal Integration Secret** (starts with `secret_`)
6. **Important**: Share your integration with the pages/databases you want to access

#### Option 2: OAuth Integration (Full Access)

1. Go to [Notion Developers](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Fill in the integration details:
   - **Name**: Your integration name (e.g., "NeuralDocs Integration")
   - **Associated workspace**: Select your workspace
   - **Capabilities**: Enable the capabilities you need:
     - Read content
     - Update content
     - Insert content
     - Read comments
     - Insert comments
4. Click "Submit"
5. Go to "OAuth & Permissions" in the sidebar
6. Add redirect URL: `http://localhost:3000/oauth-callback?source=notion`
7. Copy the **Client ID** and **Client Secret**
8. **Note**: OAuth gives access to all user content without manual sharing

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit your `.env.local` file to version control**
2. **Store tokens securely in production** - Use a database, not localStorage
3. **Use HTTPS in production** - OAuth requires secure connections
4. **Implement token refresh logic** - OAuth tokens expire
5. **Add rate limiting** - Protect your API endpoints
6. **Validate OAuth state** - Prevent CSRF attacks

## Production Deployment

For production deployment:

1. Update all redirect URIs to use your production domain
2. Store tokens in a secure database (not localStorage)
3. Implement proper token refresh mechanisms
4. Add error handling and logging
5. Set up monitoring for API rate limits
6. Use environment-specific configurations

## Testing

To test the integrations:

1. Start your development server: `npm run dev`
2. Navigate to `/knowledge-integration`
3. Click "Connect" on any source
4. Complete the OAuth flow
5. Try searching across connected sources

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"** - Make sure your redirect URI matches exactly
2. **"Invalid client"** - Check your Client ID and Secret
3. **"Scope not allowed"** - Verify you've added the required scopes
4. **CORS errors** - Ensure your domain is whitelisted
5. **Token expired** - Implement token refresh logic

### Debug Mode:

Add this to your `.env.local` for debugging:

```bash
DEBUG=oauth:*
NODE_ENV=development
```

## Next Steps

Once you have the environment variables set up:

1. Restart your development server
2. Test the OAuth flows
3. Implement proper token storage
4. Add error handling
5. Deploy to production with proper security measures
