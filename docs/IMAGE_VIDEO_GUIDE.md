# 📸 Image & Video Guide for Editor.js

## Overview

This guide explains how to use images and videos in your VARK learning modules using Editor.js.

## 🎬 Quick Summary

- **Image Tool** 🖼️ - For uploading photos, diagrams, screenshots
- **Embed Tool** 🎥 - For videos (YouTube, Vimeo, etc.) and other embeds
- Both tools work together for rich multimedia content!

## 🖼️ Adding Images

### Method 1: Upload Image File

1. **Click the `+` button** in the left margin
2. **Select "Image"** from the menu
3. **Choose "Select a file"** tab
4. **Click "Select file"** and browse your computer
5. **Select an image** (JPG, PNG, GIF, WebP, SVG)
6. **Add a caption** (optional but recommended)

**Supported Formats:**
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ GIF (.gif)
- ✅ WebP (.webp)
- ✅ SVG (.svg)
- ✅ BMP (.bmp)

**Size Limit:** 5MB per image

### Method 2: Image by URL

1. **Click the `+` button**
2. **Select "Image"**
3. **Choose "Enter URL"** tab
4. **Paste the image URL** (e.g., https://example.com/image.jpg)
5. **Click "Add"**
6. **Add a caption** (optional)

**Example URLs:**
```
https://picsum.photos/800/600
https://images.unsplash.com/photo-xxx
https://i.imgur.com/xxx.jpg
```

### Image Settings

After adding an image, you can configure:

#### **Border**
- Adds a border around the image
- Click the border icon in the toolbar

#### **Background**
- Adds a light background
- Useful for images with transparency

#### **Stretch to Full Width**
- Makes image span the full width
- Great for wide diagrams or screenshots

### Image Examples

#### **Diagrams & Charts**
Perfect for:
- Cell division diagrams
- Process flowcharts
- Anatomy illustrations
- Scientific diagrams

**Best Practice:** Use captions to explain what the image shows

#### **Screenshots**
For:
- Software tutorials
- Step-by-step instructions
- Interface demonstrations

**Best Practice:** Add arrows or highlights before uploading

#### **Photos & Illustrations**
For:
- Real-world examples
- Historical context
- Visual engagement

**Best Practice:** Use high-quality, relevant images

## 🎥 Adding Videos

### Supported Video Platforms

Editor.js Embed tool supports:

1. **YouTube** ⭐ Most Popular
2. **Vimeo**
3. **Facebook Videos**
4. **Instagram Videos**
5. **Twitter Videos**
6. **Twitch Streams**
7. **Miro Boards**
8. **CodePen**
9. **Imgur Videos**

### How to Embed a Video

#### **YouTube Example**

1. **Go to YouTube** and find your video
2. **Copy the video URL**:
   - Option A: Copy from address bar: `https://www.youtube.com/watch?v=VIDEO_ID`
   - Option B: Click "Share" → Copy link
3. **In Editor.js:**
   - Click the `+` button
   - Select "Embed"
   - Paste the YouTube URL
   - Click "Add"
4. **Add a caption** (optional)

**Supported YouTube Formats:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/embed/dQw4w9WgXcQ
```

#### **Vimeo Example**

1. **Copy Vimeo URL**: `https://vimeo.com/123456789`
2. **Click `+` → Embed**
3. **Paste URL and Add**

**Supported Vimeo Formats:**
```
https://vimeo.com/123456789
https://player.vimeo.com/video/123456789
```

### Video Best Practices

#### **For Educational Content**

✅ **DO:**
- Use short, focused videos (3-10 minutes)
- Add descriptive captions
- Test video plays correctly
- Use videos from educational channels
- Provide video transcripts in surrounding text

❌ **DON'T:**
- Embed extremely long videos (>30 min)
- Use videos with ads or inappropriate content
- Rely solely on video without text explanation
- Use copyrighted content without permission

#### **Video Types for VARK Modules**

**Visual Learners:**
- Animated explanations
- Demonstrations
- Process visualizations
- Virtual lab tours

**Auditory Learners:**
- Lectures and talks
- Interviews with experts
- Audio explanations
- Podcasts (uploaded to YouTube)

**Kinesthetic Learners:**
- Hands-on demonstrations
- Experiments
- Physical processes
- Interactive simulations

## 🎨 Styling & Layout

### Image Layout Tips

#### **Full-Width Images**
```
Best for:
- Wide diagrams
- Panoramic photos
- Comparison images
- Timeline graphics
```

#### **Centered Images (Default)**
```
Best for:
- Portrait photos
- Specific objects
- Close-up details
- Icons and logos
```

#### **Images with Borders**
```
Best for:
- Screenshots
- Scanned documents
- Defined boundaries
- Professional look
```

### Video Layout

Videos automatically:
- Display in 16:9 aspect ratio
- Fit responsive container
- Include fullscreen button
- Support playback controls

## 💾 Image Storage

### Current Implementation: Base64

**How it works:**
- Images convert to Base64 data URLs
- Stored directly in the database
- No external file hosting needed
- Works immediately without setup

**Pros:**
- ✅ Simple setup
- ✅ No external dependencies
- ✅ Always available

**Cons:**
- ⚠️ Increases database size
- ⚠️ 5MB size limit per image
- ⚠️ Slower for very large images

### Future: Cloud Storage (Supabase)

**Planned upgrade** for production:
- Upload to Supabase Storage
- CDN delivery for fast loading
- No size limit concerns
- Better performance

**To enable** (for developers):
See commented code in `lib/utils/image-upload.ts`

## 🔒 Security & Privacy

### Image Safety

✅ **Safe:**
- Images from your computer
- Educational images from reputable sources
- Creative Commons licensed images
- Stock photos

⚠️ **Check License:**
- Google Images (may be copyrighted)
- Social media images
- News photos

❌ **Avoid:**
- Copyrighted commercial images
- Images with personal information
- Inappropriate content

### Video Safety

✅ **Safe:**
- Educational YouTube channels
- Khan Academy, Crash Course, etc.
- TED Talks
- University lectures
- Creative Commons videos

⚠️ **Verify:**
- User-generated content
- Unlisted videos
- New channels

### Recommended Free Image Sources

1. **Unsplash** - https://unsplash.com
   - Free high-quality photos
   - No attribution required

2. **Pexels** - https://pexels.com
   - Free stock photos and videos
   - Easy to use

3. **Pixabay** - https://pixabay.com
   - Free images and illustrations
   - Wide variety

4. **Wikipedia Commons** - https://commons.wikimedia.org
   - Educational images
   - Historical photos

5. **NASA Images** - https://images.nasa.gov
   - Space and science images
   - Public domain

### Recommended Educational Video Sources

1. **Khan Academy** - Comprehensive lessons
2. **Crash Course** - Engaging explanations
3. **TED-Ed** - Animated lessons
4. **National Geographic** - Nature and science
5. **Veritasium** - Science explanations

## 📊 Image & Video Examples by Subject

### Biology
**Images:**
- Cell diagrams
- Anatomy charts
- Organism photos
- Microscope images

**Videos:**
- Cell division animations
- Dissection demonstrations
- Ecosystem documentaries

### Physics
**Images:**
- Force diagrams
- Circuit schematics
- Experimental setups

**Videos:**
- Experiment demonstrations
- Physics simulations
- Real-world applications

### Chemistry
**Images:**
- Molecular structures
- Periodic table
- Lab equipment

**Videos:**
- Chemical reactions
- Lab procedures
- Safety demonstrations

### Mathematics
**Images:**
- Graphs and charts
- Geometric figures
- Step-by-step solutions

**Videos:**
- Problem-solving walkthroughs
- Concept explanations
- Visual proofs

## 🎯 Learning Style Integration

### Visual Learners (👁️)
- **Use:** High-quality diagrams, charts, infographics
- **Videos:** Animations, visual explanations
- **Tip:** Add multiple views of the same concept

### Auditory Learners (🎧)
- **Use:** Videos with clear narration
- **Supplement:** Audio descriptions in captions
- **Tip:** Include lecture videos, interviews

### Reading/Writing Learners (✏️)
- **Use:** Images with text overlays
- **Captions:** Detailed written descriptions
- **Tip:** Combine images with written analysis

### Kinesthetic Learners (⚡)
- **Use:** Demo videos, step-by-step images
- **Videos:** Hands-on experiments, procedures
- **Tip:** Show processes in action

## 🐛 Troubleshooting

### Image Issues

**Problem:** Image won't upload
**Solutions:**
- Check file size (must be < 5MB)
- Verify file format (JPG, PNG, GIF, etc.)
- Try compressing the image
- Use a different image

**Problem:** Image appears broken
**Solutions:**
- Check internet connection (for URL images)
- Verify URL is correct and public
- Try re-uploading the image

**Problem:** Image loads slowly
**Solutions:**
- Reduce image file size
- Compress image before uploading
- Use web-optimized formats (WebP)

### Video Issues

**Problem:** Video won't embed
**Solutions:**
- Check URL format is correct
- Verify video is public (not private)
- Try the video's share link
- Check if platform is supported

**Problem:** Video shows "unavailable"
**Solutions:**
- Video may have been deleted
- Video may be geo-restricted
- Try a different video
- Check video privacy settings

**Problem:** Video not playing
**Solutions:**
- Click the play button
- Check browser allows iframes
- Disable ad blockers temporarily
- Try different browser

## 📱 Mobile Considerations

### Images on Mobile
- Images automatically resize
- Captions remain readable
- Touch to zoom (if supported)

### Videos on Mobile
- Responsive 16:9 ratio
- Full playback controls
- Fullscreen option available
- Data usage warning automatic

## 🔄 Workflow Tips

### Creating Content with Media

1. **Plan First**
   - Outline your lesson
   - Identify where media helps
   - Collect resources beforehand

2. **Add Text Structure**
   - Write headers and paragraphs
   - Leave placeholders for media
   - "[[Add cell diagram here]]"

3. **Insert Media**
   - Add images to enhance text
   - Embed videos for demonstrations
   - Add captions to all media

4. **Review & Test**
   - Check all images load
   - Test all videos play
   - Verify captions are clear
   - Preview on different devices

### Efficient Image Management

**Before Adding:**
- Resize large images (800-1200px width is usually enough)
- Compress if over 1MB
- Rename files descriptively
- Organize in folders by topic

**While Adding:**
- Use consistent caption style
- Add alt text (in caption)
- Consider image order
- Balance text and images

## 🎓 Advanced Tips

### Image Quality

**Resolution Guide:**
- **Diagrams:** 72-96 DPI sufficient
- **Photos:** 150 DPI for clarity
- **Print-quality:** Not needed for screen

**Compression:**
- Use tools like TinyPNG, ImageOptim
- Aim for < 200KB per image
- Balance quality vs. file size

### Creating Better Screenshots

1. **Clean Interface:** Close unnecessary tabs/windows
2. **Highlight Key Areas:** Use arrows or boxes
3. **Consistent Size:** Keep screenshots same width
4. **Annotate:** Add text or numbers to explain

### Video Timestamp Links

For YouTube, add timestamp:
```
https://youtu.be/VIDEO_ID?t=125
                         ↑
                    Start at 2:05
```

## 📚 Additional Resources

- **Canva**: Create custom diagrams
- **Figma**: Design educational graphics
- **Snagit**: Screenshot and annotation tool
- **Loom**: Record your own video lessons
- **OBS Studio**: Screen recording software

---

**Last Updated:** January 2025
**Version:** 1.0.0
