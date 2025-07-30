# Notion Integration Setup

This guide will help you set up the Notion integration using the Internal Integration Secret.

## Overview

The Notion integration uses Notion's Internal Integration API, which is simpler than OAuth and doesn't require user consent. It uses an Internal Integration Secret that you create in your Notion workspace.

## Setup Steps

### 1. Create Notion Internal Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Fill in the integration details:
   - **Name**: "NeuralDocs Integration" (or your preferred name)
   - **Associated workspace**: Select your workspace
   - **Capabilities**: Enable these capabilities:
     - ✅ Read content
     - ✅ Update content
     - ✅ Insert content
     - ✅ Read comments
     - ✅ Insert comments
4. Click "Submit"
5. **Copy the Internal Integration Secret** (starts with `secret_`)

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```bash
NOTION_INTERNAL_SECRET=secret_your_internal_secret_here
NOTION_WORKSPACE_ID=your_workspace_id_here
```

### 3. Share Integration with Pages/Databases

**Important**: You need to share your integration with the pages and databases you want to search:

1. Go to any page or database in your Notion workspace
2. Click the "Share" button in the top right
3. Click "Invite" and search for your integration name
4. Select your integration and click "Invite"
5. Repeat for all pages/databases you want to search

### 4. Test the Integration

You can test the integration by visiting:

```
http://localhost:3000/api/integrations/test-notion
```

This will verify that:

- Your environment variables are configured correctly
- The integration can connect to Notion
- The integration can search your pages/databases

## Usage

Once configured, you can:

1. Go to the Knowledge Integration page
2. Click "Connect" on the Notion card
3. The integration will be connected automatically (no OAuth popup needed)
4. You can now search across your Notion pages and databases

## Troubleshooting

### "No Notion access token or internal secret provided"

- Check that `NOTION_INTERNAL_SECRET` is set in your `.env.local` file
- Make sure the secret starts with `secret_`

### "Notion integration test failed"

- Verify your Internal Integration Secret is correct
- Make sure you've shared the integration with pages/databases
- Check that the integration has the required capabilities

### No search results

- Ensure you've shared your integration with the pages/databases you want to search
- Check that the pages/databases are in the workspace associated with your integration

## Security Notes

- Keep your Internal Integration Secret secure
- Never commit the secret to version control
- The secret has access to all pages/databases you share it with
- You can revoke access by removing the integration from pages/databases
