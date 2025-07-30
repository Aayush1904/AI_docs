# 🔍 JIRA OAuth Debug Steps

## **Current Status:**

✅ **Configuration**: JIRA environment variables are set correctly
✅ **Auth URL**: Generated successfully
❌ **Token Exchange**: Failing with 400 error

## **Step 1: Check Your Atlassian App Settings**

1. **Go to**: https://developer.atlassian.com/console/myapps/
2. **Select your app**
3. **Go to "Authorization"**
4. **Verify these settings**:

### **OAuth 2.0 Scopes** (must have ALL):

```
read:jira-work
read:jira-user
read:jira:jira
read:issue:jira
read:project:jira
read:board:jira-agile
read:jira-user:jira
```

### **Redirect URLs** (must have EXACTLY):

```
http://localhost:3000/oauth-callback?source=jira
```

## **Step 2: Check Your .env.local**

Make sure your `.env.local` has:

```bash
JIRA_CLIENT_ID=B079NAhc5rxd7FrJX4HmpFdmvOVNNCxI
JIRA_CLIENT_SECRET=your_actual_secret_here
JIRA_REDIRECT_URI=http://localhost:3000/oauth-callback?source=jira
```

## **Step 3: Test JIRA Connection**

1. **Restart your dev server**:

   ```bash
   npm run dev
   ```

2. **Go to**: `http://localhost:3000/knowledge-integration`

3. **Click "Connect" on JIRA**

4. **Check the browser console** for any errors

5. **Check the terminal logs** for detailed error messages

## **Step 4: Common Fixes**

### **If you get "Invalid redirect URI":**

- Make sure the redirect URI in your Atlassian app matches exactly
- No extra spaces or characters

### **If you get "Invalid client":**

- Copy the Client ID and Secret exactly from Atlassian Developer Console
- Don't mix up with other services

### **If you get "Scope not allowed":**

- Add all 7 scopes listed above to your Atlassian app
- Make sure there are no typos

### **If you get "Access denied":**

- Create your own JIRA Cloud workspace
- Use the same Atlassian account for both JIRA and Developer Console

## **Step 5: Alternative Test**

If JIRA OAuth keeps failing, try this:

1. **Create a new Atlassian app** with a different name
2. **Follow the setup steps exactly**
3. **Test with the new app**

## **Step 6: Check Logs**

After trying to connect JIRA, check your terminal for these logs:

- `Exchanging JIRA code for tokens...`
- `JIRA token exchange successful` (or error details)
- `Getting JIRA accessible resources...`

## **🚨 Most Likely Issues:**

1. **Wrong Client Secret** - Copy it exactly from Atlassian Developer Console
2. **Missing Scopes** - Add all 7 scopes to your app
3. **Wrong Redirect URI** - Must match exactly in both places
4. **No JIRA Cloud Workspace** - You need your own JIRA instance

## **📞 Need More Help?**

If you're still having issues:

1. Share the exact error message from the terminal
2. Check if you have your own JIRA Cloud workspace
3. Verify all scopes are added to your Atlassian app
