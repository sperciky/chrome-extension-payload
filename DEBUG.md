# Debugging Guide - Chrome Extension Not Loading

## Step 1: Verify Extension is Loaded

1. Go to `chrome://extensions/`
2. Find "Google Sheets MP Data Formatter"
3. Check:
   - [ ] Extension is enabled (toggle is ON)
   - [ ] No errors shown under the extension
   - [ ] Version shows "1.0.0"

## Step 2: Check for Errors

1. On `chrome://extensions/` page
2. Click "Details" on your extension
3. Look for "Errors" button at the bottom
4. If there are errors, copy them

## Step 3: Verify Files

Check that these files exist in your extension folder:
- [ ] manifest.json
- [ ] content.js
- [ ] content.css
- [ ] popup.html
- [ ] popup.js
- [ ] popup.css
- [ ] action_popup.html
- [ ] action_popup.js
- [ ] action_popup.css
- [ ] icon16.png
- [ ] icon48.png
- [ ] icon128.png

## Step 4: Test Content Script Loading

1. Open Google Sheets: https://docs.google.com/spreadsheets/d/YOUR_ID/edit
2. Open DevTools (F12)
3. Go to "Sources" tab
4. Look in the left sidebar under "Content scripts"
5. You should see your extension listed
6. Can you find content.js there?

## Step 5: Manual Test

Try this in the console (F12 → Console):

```javascript
// Test 1: Check if content script is in the page
console.log('Extension loaded:', typeof chrome !== 'undefined' && chrome.runtime);

// Test 2: Manually run a simple version
if (typeof chrome !== 'undefined') {
  console.log('Chrome extension API available');
  console.log('Extension ID:', chrome.runtime.id);
}
```

## Step 6: Check URL Pattern

What is your EXACT Google Sheets URL? Copy it here:
```
https://docs.google.com/spreadsheets/d/...
```

Does it match the pattern: `https://docs.google.com/spreadsheets/d/*`?

## Common Issues

### Issue 1: Extension Not Reloaded
- After making changes, you MUST click the reload icon on chrome://extensions/
- Then refresh the Google Sheets page

### Issue 2: Wrong URL
- Extension only works on: `https://docs.google.com/spreadsheets/d/*`
- NOT on: `https://docs.google.com/` (homepage)

### Issue 3: Permissions Blocked
- Chrome might have blocked the extension
- Check chrome://extensions/ for any warnings

### Issue 4: Content Security Policy
- Google Sheets has strict CSP
- Our extension should work within these limits

## Next Steps

Share the results of:
1. Any errors from chrome://extensions/
2. Your exact Google Sheets URL
3. What you see in Sources → Content scripts
4. Results of the manual test from Step 5
