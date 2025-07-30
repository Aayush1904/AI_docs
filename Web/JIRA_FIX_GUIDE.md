# 🚨 JIRA Access Denied - Complete Fix Guide

## **Step 1: Create Your Own JIRA Cloud Account**

If you don't have a JIRA account, create one first:

1. **Go to JIRA Cloud**: https://www.atlassian.com/software/jira
2. **Click "Get it free"**
3. **Create your account** with your email
4. **Choose a workspace name** (e.g., "myworkspace")
5. **Complete the setup** - this gives you your own JIRA instance

**Your JIRA URL will be**: `https://yourworkspace.atlassian.net`

## **Step 2: Fix Your Atlassian App Configuration**

### A. Go to Atlassian Developer Console

1. Visit: https://developer.atlassian.com/console/myapps/
2. Sign in with the same account you used for JIRA Cloud

### B. Create a New App (or Fix Existing)

1. **Click "Create" → "Create app"**
2. **Choose "OAuth 2.0 (3LO)"**
3. **Fill in app details**:
   - **App name**: "Knowledge Integration"
   - **App description**: "Multi-source knowledge search integration"
   - **App logo**: Upload a logo (optional)

### C. Configure OAuth Settings

1. **Go to "Authorization" in the left sidebar**
2. **Add these EXACT scopes**:
   ```
   read:jira-work
   read:jira-user
   read:jira:jira
   read:issue:jira
   read:project:jira
   read:board:jira-agile
   read:jira-user:jira
   ```
3. **Add Redirect URLs**:
   - `http://localhost:3000/oauth-callback?source=jira`

### D. Get Your Credentials

1. **Go to "Settings" → "App details"**
2. **Copy the Client ID and Client Secret**
3. **Update your `.env.local`**:
   ```bash
   JIRA_CLIENT_ID=your_actual_client_id_here
   JIRA_CLIENT_SECRET=your_actual_client_secret_here
   JIRA_REDIRECT_URI=http://localhost:3000/oauth-callback?source=jira
   ```

## **Step 3: Test the Connection**

1. **Restart your dev server**:

   ```bash
   npm run dev
   ```

2. **Go to your app**: `http://localhost:3000/knowledge-integration`

3. **Click "Connect" on JIRA**

4. **You should see Atlassian's consent screen** asking you to authorize the app

5. **Click "Allow"** - this should work now!

## **🚨 Common Mistakes to Avoid**

### ❌ **Don't use someone else's JIRA instance**

- You need your own JIRA Cloud workspace
- The app must be authorized for YOUR workspace

### ❌ **Don't skip the scopes**

- All 7 scopes must be added exactly as shown
- Missing scopes = access denied

### ❌ **Don't use wrong redirect URI**

- Must be exactly: `http://localhost:3000/oauth-callback?source=jira`
- No extra spaces or characters

### ❌ **Don't use wrong credentials**

- Copy Client ID and Secret exactly from Atlassian Developer Console
- Don't mix up with other services

## **🔍 Debug Checklist**

Before trying again, verify:

- [ ] You have your own JIRA Cloud workspace
- [ ] You're signed into Atlassian Developer Console with the same account
- [ ] All 7 scopes are added to your app
- [ ] Redirect URI is exactly `http://localhost:3000/oauth-callback?source=jira`
- [ ] Your `.env.local` has the correct Client ID and Secret
- [ ] Your dev server is running on `http://localhost:3000`

## **📞 Still Having Issues?**

If you're still getting "Access denied":

1. **Create a completely new JIRA Cloud workspace**
2. **Create a completely new Atlassian app**
3. **Follow the steps above exactly**
4. **Make sure you're using the same Atlassian account for both**

The key is having your own JIRA instance that you control!
