# 🔄 Complete Restart Checklist

Follow these steps in order when tools aren't showing:

## Step 1: Stop Dev Server
```bash
Ctrl + C
```
Wait until it fully stops.

## Step 2: Clear Node Modules Cache (Optional but Recommended)
```bash
# Windows PowerShell
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

## Step 3: Restart Dev Server
```bash
npm run dev
```
Wait for "Ready on http://localhost:3000"

## Step 4: Clear Browser Completely

### Chrome/Edge:
1. Press `Ctrl + Shift + Delete`
2. Select:
   - ✅ Cached images and files
   - ✅ Cookies and site data
3. Time range: **Last 24 hours**
4. Click "Clear data"

### Or Hard Refresh:
- `Ctrl + F5` (Windows)
- `Cmd + Shift + R` (Mac)

## Step 5: Test in Incognito/Private Mode

1. Open browser in Incognito/Private mode
2. Go to `http://localhost:3000`
3. Navigate to the editor
4. Click `+` button

If it works in Incognito, it's definitely a cache issue!

## Step 6: Verify Tools in Console

Open browser console (F12) and check the logs:

Should see:
```
✅ Editor.js tools loaded: {
  Media Blocks: '1 image + 1 embed (videos)'
}
```

## Step 7: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for `@editorjs/embed` in loaded files
5. Should see status `200 OK`

---

## 🐛 If Still Not Working

Try this diagnostic:

1. Open browser console (F12)
2. After editor loads, type:
```javascript
// Check if embed tool is in the tools
console.log('Checking tools...', editorRef?.current?.configuration?.tools);
```

If you see `embed: {...}` then the tool is configured correctly and it's a UI issue.

---

## 💡 Common Issues

### Issue 1: Old Cache
**Solution:** Clear browser cache completely (Step 4)

### Issue 2: Dev Server Not Restarted
**Solution:** Full restart with cache clear (Steps 1-3)

### Issue 3: Editor.js Internal Cache
**Solution:** Try Incognito mode (Step 5)

### Issue 4: Import Error
**Check console for:** Red error messages mentioning "embed" or "@editorjs/embed"

---

## ✅ Success Indicators

When everything works, you should see:

### In Console:
```
🔍 Editor.js Tools Check: {
  EmbedTool: true,
  Embed = Videos: true
}

✅ Editor.js tools loaded: {
  Media Blocks: '1 image + 1 embed (videos)'
}
```

### In Editor Menu:
When you click `+` button, you see:
- Text
- Heading
- Quote
- Code
- Unordered List
- Ordered List
- Checklist
- **Image** ⭐
- **Embed** ⭐ (This should appear!)
- Table
- Warning
- Delimiter

---

Last Updated: Oct 2025
