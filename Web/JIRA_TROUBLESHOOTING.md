# JIRA Integration Troubleshooting Guide

## 🚨 Common JIRA "Access Denied" Issues

### Issue 1: App Not Approved

**Error**: "This app requires access to a Jira site which you don't have or don't have the permission to access."

**Solutions**:

1. **For Development**: Use your own JIRA instance or create a free JIRA Cloud account
2. **For Production**: Submit your app for approval in Atlassian Marketplace
3. **Alternative**: Use JIRA Cloud with your own account

### Issue 2: Incorrect Scopes

**Error**: "Insufficient permissions"

**Required Scopes**:

```
read:jira-work
read:jira-user
read:jira:jira
read:issue:jira
read:project:jira
read:board:jira-agile
read:jira-user:jira
```

### Issue 3: Wrong Redirect URI

**Error**: "Invalid redirect URI"

**Correct URIs**:

- Development: `http://localhost:3000/oauth-callback?source=jira`
- Production: `https://yourdomain.com/oauth-callback?source=jira`

## 🔧 Step-by-Step JIRA Setup

### 1. Create JIRA Cloud Account (if you don't have one)

1. Go to [JIRA Cloud](https://www.atlassian.com/software/jira)
2. Click "Get it free"
3. Create your account and workspace
4. Note your workspace URL (e.g., `yourworkspace.atlassian.net`)

### 2. Create Atlassian App

1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Click "Create" → "Create app"
3. Choose "OAuth 2.0 (3LO)"
4. Fill in app details:
   - **App name**: "Knowledge Integration"
   - **App description**: "Multi-source knowledge search integration"
   - **App logo**: Upload a logo (optional)

### 3. Configure OAuth Settings

1. Go to "Authorization" in the left sidebar
2. Add these **OAuth 2.0 scopes**:
   ```
   read:jira-work
   read:jira-user
   read:jira:jira
   read:issue:jira
   read:project:jira
   read:board:jira-agile
   read:jira-user:jira
   ```
3. Add **Redirect URLs**:
   - `http://localhost:3000/oauth-callback?source=jira`

### 4. Get Credentials

1. Go to "Settings" → "App details"
2. Copy the **Client ID** and **Client Secret**
3. Add to your `.env.local`:
   ```bash
   JIRA_CLIENT_ID=your_client_id_here
   JIRA_CLIENT_SECRET=your_client_secret_here
   JIRA_REDIRECT_URI=http://localhost:3000/oauth-callback?source=jira
   ```

### 5. Test the Integration

1. Start your dev server: `npm run dev`
2. Go to `/knowledge-integration`
3. Click "Connect" on JIRA
4. Complete the OAuth flow
5. You should be redirected back to your app

## 🐛 Debug Steps

### Check Your JIRA App Configuration

1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Select your app
3. Go to "Authorization"
4. Verify all scopes are added
5. Verify redirect URIs are correct

### Check Your Environment Variables

```bash
# In your .env.local file
JIRA_CLIENT_ID=your_actual_client_id
JIRA_CLIENT_SECRET=your_actual_client_secret
JIRA_REDIRECT_URI=http://localhost:3000/oauth-callback?source=jira
```

### Test with Different JIRA Instance

If you're still getting access denied:

1. Create a new JIRA Cloud workspace
2. Use that workspace for testing
3. Make sure you're the admin of that workspace

## 🔍 Common Error Messages

| Error                  | Cause                                 | Solution                              |
| ---------------------- | ------------------------------------- | ------------------------------------- |
| "Access denied"        | App not approved or wrong permissions | Use your own JIRA instance            |
| "Invalid redirect URI" | Wrong redirect URL                    | Check your redirect URI configuration |
| "Invalid client"       | Wrong Client ID/Secret                | Verify your credentials               |
| "Scope not allowed"    | Missing scopes                        | Add all required scopes               |

## 📞 Need Help?

If you're still having issues:

1. Check the browser console for detailed error messages
2. Verify your JIRA Cloud workspace is active
3. Make sure you're using the correct Client ID and Secret
4. Try creating a new JIRA Cloud workspace for testing

## 🚀 Production Deployment

For production:

1. Submit your app for Atlassian Marketplace approval
2. Update redirect URIs to your production domain
3. Use a secure database for token storage
4. Implement proper error handling and logging
