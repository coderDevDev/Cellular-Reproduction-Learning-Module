# 🎥 How to Add Videos in Editor.js

## ⚠️ Important: Videos Don't Auto-Embed!

**You CANNOT just paste a YouTube link** and expect it to embed automatically.

Editor.js **requires you to explicitly use the Video tool**.

---

## ✅ Correct Way to Add Videos

### **Step 1: Click the `+` Button**

In the left margin of the editor, click the **`+`** button to open the tools menu.

### **Step 2: Select "Video" from Menu**

Scroll through the menu and click on:
```
🎬 Video
```

(It might also be labeled as "Embed")

### **Step 3: Paste Your Video URL**

A text input box will appear. Paste your video URL:

**YouTube Example:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**Or short format:**
```
https://youtu.be/dQw4w9WgXcQ
```

**Vimeo Example:**
```
https://vimeo.com/123456789
```

### **Step 4: Press Enter or Click "Add"**

The video will embed into your content! 🎉

### **Step 5: Add Caption (Optional)**

Click below the video to add a descriptive caption.

---

## 🎯 Supported Video Platforms

### ✅ Fully Supported:

1. **YouTube** ⭐ (Most common)
   - Regular: `https://www.youtube.com/watch?v=VIDEO_ID`
   - Short: `https://youtu.be/VIDEO_ID`
   - Embed: `https://www.youtube.com/embed/VIDEO_ID`

2. **Vimeo**
   - `https://vimeo.com/123456789`
   - `https://player.vimeo.com/video/123456789`

3. **Facebook Videos**
   - `https://www.facebook.com/watch/?v=123456789`

4. **Instagram Videos**
   - `https://www.instagram.com/p/ABC123/`

5. **Twitter Videos**
   - `https://twitter.com/user/status/123456789`

6. **Twitch Clips/Videos**
   - `https://www.twitch.tv/videos/123456789`
   - `https://clips.twitch.tv/ClipName`

7. **CodePen** (for coding demos)
   - `https://codepen.io/username/pen/ABC123`

8. **Imgur Videos**
   - `https://imgur.com/ABC123`

9. **Miro Boards** (for diagrams)
   - `https://miro.com/app/board/ABC123`

---

## 🚫 What DOESN'T Work

### ❌ Direct MP4/Video Files
```
https://example.com/video.mp4  ❌ Won't work
```

**Why:** The Embed tool is designed for platform embeds, not direct video files.

**Solution:** Upload to YouTube (free and private options available)

### ❌ Pasting Link in Text
```
Just pasting: https://youtu.be/ABC  ❌ Won't embed
```

**Why:** Editor.js doesn't auto-detect video links.

**Solution:** Use the Video tool explicitly (see steps above)

### ❌ Google Drive Videos
```
https://drive.google.com/file/d/123  ❌ Won't work
```

**Why:** Google Drive requires authentication.

**Solution:** Upload to YouTube instead

---

## 📋 Complete Example Workflow

Let's add a biology video lesson:

### **1. Find a Video**
Go to YouTube and find a video about cell division:
```
https://www.youtube.com/watch?v=Wy3N5NCZBHQ
```

### **2. In Editor.js:**
1. Click **`+`** button
2. Select **"Video"**
3. Paste: `https://www.youtube.com/watch?v=Wy3N5NCZBHQ`
4. Press Enter

### **3. Add Caption:**
```
Cell Division: Mitosis and Meiosis Explained
```

### **4. Result:**
You'll see the YouTube video embedded with playback controls!

---

## 🎨 Customization Options

### **Caption**
- Click below video to add description
- Example: "Watch this 5-minute explanation of mitosis"

### **Inline Toolbar**
- Click the video block
- Formatting options appear

---

## 🐛 Troubleshooting

### **Issue 1: "Video" Not in Menu**

**Symptoms:**
- Click `+` button
- Don't see "Video" or "Embed" option

**Solutions:**
1. **Restart dev server:**
   ```bash
   Ctrl + C
   npm run dev
   ```

2. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear cached files
   - Refresh page (`Ctrl + F5`)

3. **Try Incognito mode:**
   - Open browser in private/incognito
   - Test if Video tool appears

4. **Check console (F12):**
   - Should see: `Media Blocks: '1 image + 1 embed (videos)'`
   - If not, there's a config issue

---

### **Issue 2: Video Link Doesn't Embed**

**Symptoms:**
- Paste link but nothing happens
- Or shows error

**Causes & Solutions:**

**A. Using wrong method:**
```
❌ Pasting link as text
✅ Use Video tool from + menu
```

**B. Unsupported platform:**
```
❌ Direct .mp4 files
✅ Use YouTube/Vimeo instead
```

**C. Invalid URL format:**
```
❌ https://youtu.be/watch?v=ABC (wrong format)
✅ https://youtu.be/ABC (correct)
✅ https://www.youtube.com/watch?v=ABC (correct)
```

**D. Private/Unlisted video:**
```
✅ Make video Public or Unlisted on YouTube
✅ Check video sharing settings
```

---

### **Issue 3: Video Shows But Won't Play**

**Causes & Solutions:**

**A. Ad blocker:**
- Disable ad blocker temporarily
- Try different browser

**B. Network firewall:**
- Check if YouTube is blocked
- Try different network

**C. Browser compatibility:**
- Update browser to latest version
- Try Chrome/Edge/Firefox

---

## 💡 Pro Tips

### **Tip 1: Use Timestamps**
In your caption, reference specific timestamps:
```
"Watch the prophase explanation at 2:15"
```

### **Tip 2: Create Playlists**
For multi-part lessons:
```
Part 1: Introduction
[Video 1]

Part 2: Deep Dive
[Video 2]

Part 3: Practice
[Video 3]
```

### **Tip 3: Mix Media**
Combine videos with other blocks:
```
[Paragraph: Introduction text]
[Video: Overview lecture]
[List: Key points to remember]
[Image: Detailed diagram]
[Video: Lab demonstration]
```

### **Tip 4: Use Chapter Markers**
For long videos, add text guide:
```
[Video: Cell Division Complete Guide]

Chapter Guide:
• 0:00 - Introduction
• 2:30 - Prophase
• 5:15 - Metaphase
• 8:00 - Anaphase
• 11:20 - Telophase
```

### **Tip 5: Provide Alternatives**
For accessibility:
```
[Video: Mitosis Animation]

Can't watch video? Read the summary below:
[Paragraph: Text alternative]
```

---

## 📊 Quick Reference

| Task | Action |
|------|--------|
| **Add video** | `+` button → Video → Paste URL |
| **Supported** | YouTube, Vimeo, Facebook, Instagram, Twitter |
| **Not supported** | .mp4 files, Google Drive |
| **Caption** | Click below video after embedding |
| **Edit** | Click video → inline toolbar |
| **Delete** | Click video → click trash icon |

---

## ✅ Success Checklist

Before you ask for help:

- [ ] Used the Video tool (not just pasted link)
- [ ] Video is public/unlisted on platform
- [ ] URL format is correct
- [ ] Tried in incognito mode
- [ ] Cleared browser cache
- [ ] Restarted dev server
- [ ] Checked console for errors (F12)
- [ ] Video tool appears in `+` menu

---

## 🎓 Example: Complete Biology Lesson

```markdown
# Cell Division

## Introduction
[Paragraph: Brief overview of cell division]

## Video Lesson
[Video: https://www.youtube.com/watch?v=EXAMPLE]
Caption: "Cell Division Explained - Watch this 10-minute overview"

## Key Concepts
[List]
• Mitosis creates identical cells
• Meiosis creates gametes
• DNA replication occurs first

## Detailed Diagram
[Image: cell-division-diagram.png]
Caption: "The four stages of mitosis"

## Interactive Practice
[Video: https://www.youtube.com/watch?v=EXAMPLE2]
Caption: "Try this interactive simulation"

## Summary
[Paragraph: Recap of main points]
```

---

## 🆘 Still Having Issues?

### **1. Check Console Log**

Press `F12` and look for:
```javascript
✅ Editor.js tools loaded: {
  Media Blocks: '1 image + 1 embed (videos)'
}

🔧 All tool names: [..., 'embed', ...]

🎥 Embed tool config: {
  hasClass: true,
  hasToolbox: true,
  toolboxTitle: 'Video'
}
```

### **2. Verify Video Tool Exists**

In the `+` menu, you should see:
```
🎬 Video
```

If you see "Video" but can't embed:
- Check URL format
- Try a different video
- Check video privacy settings

If you DON'T see "Video":
- Clear all caches
- Full server restart
- Try incognito mode

---

**Last Updated:** October 2025  
**Status:** Video/Embed tool configured ✅  
**Title in Menu:** "Video" 🎬
