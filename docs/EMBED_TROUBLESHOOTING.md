# 🎥 Embed Tool Troubleshooting Guide

## Problem: Embed Tool Not Showing in Editor.js

If you can see **Image** tool but **NOT** the **Embed** tool, follow these steps:

---

## ✅ **Solution Steps**

### **Step 1: Restart Dev Server** ⚡

The most common reason is that new packages need a server restart.

```bash
# In your terminal where dev server is running:
Ctrl + C  (stop server)
npm run dev  (restart server)
```

**Wait for:** `Ready on http://localhost:3000`

---

### **Step 2: Clear Browser Cache** 🧹

After restarting:

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"

**OR Simple Method:**
- Press `Ctrl + F5` (hard refresh)

---

### **Step 3: Check Browser Console** 🔍

1. Open your page with the editor
2. Press `F12` to open Developer Tools
3. Click "Console" tab
4. Look for these messages:

**✅ GOOD - You should see:**
```
🔍 Editor.js Tools Check: {
  ImageTool: true,
  EmbedTool: true,
  EmbedToolType: "function"
}
✅ Embed tool added to Editor.js
✅ Editor.js is ready!
```

**❌ BAD - Problem indicators:**
```
⚠️ Embed tool not available - videos won't work
EmbedTool: false
```

---

### **Step 4: Test the Editor** 🧪

Visit the test page:
```
http://localhost:3000/test-editor
```

Click the **`+`** button and check if you see:
- ✅ Paragraph
- ✅ Header
- ✅ List
- ✅ Quote
- ✅ Table
- ✅ Code
- ✅ **Image** ⭐
- ✅ **Embed** ⭐ (this is what we need!)

---

## 🔧 **Advanced Troubleshooting**

### If Embed Still Doesn't Work:

#### **A. Verify Package Installation**

```bash
npm list @editorjs/embed
```

**Expected output:**
```
@editorjs/embed@2.7.6
```

**If missing, reinstall:**
```bash
npm install @editorjs/embed
npm run dev
```

#### **B. Check for Import Errors**

Open browser console (F12) and look for:
```
Cannot find module '@editorjs/embed'
Failed to load embed tool
```

If you see these, run:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### **C. Test Embed Tool Manually**

In browser console, type:
```javascript
import('@editorjs/embed').then(m => console.log('Embed loaded:', m))
```

Should show: `Embed loaded: {default: function}`

---

## 🎬 **How to Use Embed (Once Working)**

### **YouTube Example:**

1. Go to YouTube, find a video
2. Copy the URL: `https://www.youtube.com/watch?v=VIDEO_ID`
3. In Editor.js:
   - Click `+` button
   - Select **"Embed"**
   - Paste the URL
   - Click "Add"
4. Video appears! 🎉

### **Supported URL Formats:**

**YouTube:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/embed/dQw4w9WgXcQ
```

**Vimeo:**
```
https://vimeo.com/123456789
https://player.vimeo.com/video/123456789
```

**Instagram:**
```
https://www.instagram.com/p/ABC123/
```

**Twitter:**
```
https://twitter.com/user/status/123456789
```

---

## 🐛 **Common Errors & Fixes**

### Error: "Embed service is not supported"

**Cause:** The video platform isn't in the supported list

**Fix:** Check if your platform is supported:
- ✅ YouTube
- ✅ Vimeo
- ✅ Facebook
- ✅ Instagram
- ✅ Twitter
- ✅ Twitch
- ✅ CodePen
- ✅ Imgur

### Error: "Cannot load embed"

**Causes:**
1. Video is private/unavailable
2. Invalid URL format
3. Network/firewall blocking

**Fixes:**
1. Make sure video is public
2. Use the share link from the platform
3. Check internet connection

### Embed shows but video doesn't play

**Causes:**
1. Ad blocker blocking iframe
2. Browser security settings
3. CORS/security policy

**Fixes:**
1. Disable ad blocker temporarily
2. Try different browser
3. Check video embed settings on platform

---

## 📊 **Debug Checklist**

Use this to systematically check everything:

```
□ Dev server restarted
□ Browser cache cleared
□ Hard refresh done (Ctrl + F5)
□ Console shows no errors
□ Console shows "Embed tool added"
□ Package @editorjs/embed installed
□ Image tool works (to verify editor works)
□ Test page visited
□ + button shows Embed option
```

---

## 💡 **Quick Tips**

### **Fastest Fix (Works 90% of time):**
```bash
# Stop server (Ctrl + C)
npm run dev
# Hard refresh browser (Ctrl + F5)
```

### **Nuclear Option (If nothing else works):**
```bash
# Stop server
rm -rf node_modules package-lock.json
npm install
npm run dev
# Clear browser cache
# Hard refresh
```

### **Check if it's a Code Issue:**

If other developers can see Embed but you can't:
- It's a local environment issue
- Clear everything and reinstall

If NO ONE can see Embed:
- Check the code import
- Verify package.json has @editorjs/embed

---

## 📞 **Still Need Help?**

### **Information to Provide:**

1. **Browser Console Output:**
   - Copy the "Tools Check" message
   - Copy any errors in red

2. **Package Version:**
   ```bash
   npm list @editorjs/embed
   ```

3. **Node Version:**
   ```bash
   node --version
   ```

4. **What You See:**
   - Screenshot of the + button menu
   - List of tools that appear

---

## ✅ **Success Indicators**

You'll know it's working when:

1. **Console shows:**
   ```
   ✅ Embed tool added to Editor.js
   ✅ Editor.js is ready!
   ```

2. **+ button menu shows:**
   - Image (with image icon)
   - **Embed (with play icon)** ⭐

3. **You can:**
   - Click Embed
   - Paste YouTube URL
   - See video preview
   - Play video in editor

---

## 🎓 **Understanding the Fix**

### Why restart is needed:

When you install new npm packages:
- Packages download to `node_modules/`
- But the running dev server has old cached modules
- Restart loads the new packages
- Browser cache also needs clearing

### Why Embed has issues:

The `@editorjs/embed` package has TypeScript module resolution issues but works fine at runtime. We use `@ts-expect-error` to suppress the warning and dynamically check if it loaded before adding to tools.

---

**Last Updated:** January 2025
**Issue:** Embed tool not showing
**Status:** SOLVED - Follow steps above
