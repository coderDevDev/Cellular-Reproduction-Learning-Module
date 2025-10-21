# CKEditor Image Handling Improvements

## Problem Statement

When copying content from **Google Docs** or **MS Word** into the VARK module editor, images were experiencing alignment and positioning issues:

- ❌ Images not properly aligned
- ❌ Incorrect positioning/floating
- ❌ Inline styles from Office apps causing conflicts
- ❌ Captions not displaying correctly
- ❌ Responsive issues on mobile

## Root Causes

### 1. **Office Inline Styles**
Google Docs and MS Word add numerous inline styles to images:
```html
<img style="position: absolute; float: left; vertical-align: middle; border: 1px solid; ...">
```

These styles conflict with the editor's layout system.

### 2. **No Default Image Type**
CKEditor didn't have a default insertion type, causing pasted images to render inconsistently.

### 3. **Insufficient Style Filtering**
The `htmlSupport` configuration was allowing problematic CSS properties that should be stripped.

### 4. **Missing Image Style Classes**
Custom CSS classes for proper image alignment weren't fully defined.

---

## Solutions Implemented

### 1. **Enhanced Image Configuration**

#### **Added Default Insert Type**
```typescript
image: {
  insert: {
    type: 'block'  // Pasted images default to block-level
  }
}
```

**Benefit:** All pasted images now consistently use block-level layout instead of inline.

#### **Improved Image Styles**
```typescript
styles: {
  options: [
    'inline',
    'alignLeft',
    'alignCenter',
    'alignRight',
    'block',
    'wrapText',
    'breakText'
  ]
}
```

**Benefit:** Teachers have full control over image positioning with clear visual options.

#### **Added 100% Resize Option**
```typescript
resizeOptions: [
  { name: 'resizeImage:original', label: 'Original', value: null },
  { name: 'resizeImage:25', label: '25%', value: '25' },
  { name: 'resizeImage:50', label: '50%', value: '50' },
  { name: 'resizeImage:75', label: '75%', value: '75' },
  { name: 'resizeImage:100', label: '100%', value: '100' }  // NEW
]
```

**Benefit:** Images can be set to full width of content area.

---

### 2. **Stricter HTML Support Filtering**

#### **Whitelist Approach**
Instead of allowing all styles, now only allow essential ones:

```typescript
htmlSupport: {
  allow: [
    {
      name: 'img',
      styles: {
        'width': true,
        'height': true,
        'max-width': true,
        'display': true,
        'margin': true
        // position, float, vertical-align, border: BLOCKED
      }
    }
  ]
}
```

**Blocked Styles:**
- ❌ `position` - Causes absolute positioning issues
- ❌ `float` - Conflicts with alignment system
- ❌ `vertical-align` - Inconsistent rendering
- ❌ `border` - Should use editor's border tools
- ❌ `font-family`, `font-size`, `line-height` - Text styles from Office
- ❌ `mso-*` - All Microsoft Office-specific styles

**Allowed Styles:**
- ✅ `width`, `height` - Image dimensions
- ✅ `max-width` - Responsive sizing
- ✅ `display` - Block/inline control
- ✅ `margin` - Spacing control
- ✅ `text-align` - Caption alignment
- ✅ `color`, `background-color` - Text styling

---

### 3. **Custom CSS Stylesheet**

Created `ckeditor-image-styles.css` with proper image styling:

#### **Base Image Styles**
```css
.ck-content figure.image {
  display: table;
  clear: both;
  text-align: center;
  margin: 1em auto;
  max-width: 100%;
}

.ck-content figure.image img {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
}
```

**Benefits:**
- Images are responsive (max-width: 100%)
- Proper centering and spacing
- Clear floats to prevent overlap

#### **Alignment Classes**

**Left Align:**
```css
.ck-content figure.image.image-style-align-left {
  float: left;
  margin-right: 1.5em;
  margin-bottom: 1em;
}
```

**Center Align:**
```css
.ck-content figure.image.image-style-align-center {
  margin-left: auto;
  margin-right: auto;
  display: table;
}
```

**Right Align:**
```css
.ck-content figure.image.image-style-align-right {
  float: right;
  margin-left: 1.5em;
  margin-bottom: 1em;
}
```

#### **Caption Styles**
```css
.ck-content figure.image figcaption {
  display: table-caption;
  caption-side: bottom;
  padding: 0.6em;
  font-size: 0.875em;
  text-align: center;
  background-color: #f7f7f7;
}
```

**Benefits:**
- Captions properly positioned below images
- Consistent styling across all modules
- Readable font size and spacing

#### **Google Docs/Word Paste Fixes**
```css
.ck-content img {
  position: relative !important;  /* Override absolute positioning */
  transform: none !important;      /* Remove transforms */
  border: none !important;         /* Remove borders */
  vertical-align: baseline;        /* Fix alignment */
  box-sizing: border-box;
}
```

**Benefits:**
- Forces images into proper flow
- Removes problematic Office styles
- Ensures consistent rendering

#### **Responsive Design**
```css
@media (max-width: 768px) {
  .ck-content .image-style-wrap-text,
  .ck-content .image-style-align-left,
  .ck-content .image-style-align-right {
    float: none;
    max-width: 100%;
    margin: 1em auto;
  }
}
```

**Benefits:**
- Images stack vertically on mobile
- No horizontal overflow
- Better mobile UX

---

## Image Style Options

### 1. **Inline** 🔹
Images flow with text, like a word.
```
Text text text [image] text text text.
```

### 2. **Align Left** ⬅️
Image floats left, text wraps around the right side.
```
[Image]  Text text text text
         text text text text
         text text text text
```

### 3. **Align Center** ⬛
Image centered, text above and below.
```
       Text text text
       
       [Image]
       
       Text text text
```

### 4. **Align Right** ➡️
Image floats right, text wraps around the left side.
```
Text text text text  [Image]
text text text text
text text text text
```

### 5. **Wrap Text** 🔄
Image floats left with text wrapping, max 50% width.
```
[Small   Text text text text text
Image]   text text text text text
         text text text text text
```

### 6. **Break Text** 📏
Image breaks text flow, full width, centered.
```
Text text text text text

[Full Width Image]

Text text text text text
```

---

## How to Use

### **For Teachers Creating Modules**

#### **Method 1: Upload Image**
1. Click the **Upload Image** button in toolbar
2. Select image file
3. Image inserts as centered block
4. Click image to show toolbar
5. Select alignment style
6. Optionally add caption

#### **Method 2: Paste from Google Docs/Word**
1. Copy content from Google Docs (Ctrl+C)
2. Paste into editor (Ctrl+V)
3. **PasteFromOffice** plugin automatically cleans styles
4. Images are converted to block-level
5. Click image to adjust alignment if needed
6. Add or edit caption

#### **Method 3: Paste Image Directly**
1. Copy image from any source
2. Paste into editor
3. Image inserts as base64 data
4. Adjust size using resize handles
5. Select alignment style

### **Resizing Images**

**Option 1: Visual Handles**
- Click image
- Drag corner handles to resize
- Maintains aspect ratio

**Option 2: Size Dropdown**
- Click image
- Click resize button in toolbar
- Select: Original, 25%, 50%, 75%, 100%

**Option 3: Manual Width**
- Click image
- Right-click → Image properties
- Enter custom width

### **Adding Captions**

1. Click image
2. Click **Toggle Caption** in toolbar
3. Caption field appears below image
4. Type caption text (e.g., "Figure 3.1: Human Sexual Reproduction")
5. Caption automatically styled

---

## Before vs After

### Before (Problematic)

```html
<!-- Pasted from Google Docs -->
<img src="..." style="position: absolute; left: 50px; top: 100px; 
     float: left; vertical-align: middle; border: 1px solid #000; 
     font-family: Arial; mso-wrap-style: square;">
```

**Issues:**
- Absolute positioning breaks layout
- Float + position conflict
- Office-specific styles (mso-*)
- Inline border styling

### After (Fixed)

```html
<!-- After cleanup -->
<figure class="image image-style-align-center">
  <img src="..." alt="Human Sexual Reproduction" 
       style="max-width: 100%; height: auto;">
  <figcaption>Figure 3.1: Human Sexual Reproduction</figcaption>
</figure>
```

**Benefits:**
- ✅ Semantic HTML structure
- ✅ Responsive sizing
- ✅ Proper alignment class
- ✅ Clean inline styles
- ✅ Accessible caption

---

## Technical Details

### Files Modified

1. ✅ **`ckeditor-content-editor.tsx`**
   - Added image insert configuration
   - Improved style options
   - Enhanced htmlSupport filtering
   - Added 100% resize option

2. ✅ **`ckeditor-image-styles.css`** (NEW)
   - Complete image styling system
   - Alignment classes
   - Caption styles
   - Responsive design
   - Print styles

### Plugins Used

- **Image** - Core image functionality
- **ImageCaption** - Caption support
- **ImageResize** - Visual resizing
- **ImageStyle** - Alignment options
- **ImageToolbar** - Image toolbar
- **ImageUpload** - File upload
- **Base64UploadAdapter** - Base64 encoding
- **PasteFromOffice** - Google Docs/Word cleanup
- **GeneralHtmlSupport** - HTML filtering

---

## Testing Checklist

### Upload Tests
- [x] Upload JPG image
- [x] Upload PNG image  
- [x] Upload GIF image
- [x] Upload WebP image
- [x] Large image (> 5MB)
- [x] Small image (< 100KB)

### Paste Tests
- [x] Paste from Google Docs (with images)
- [x] Paste from MS Word (with images)
- [x] Paste image directly (Ctrl+V)
- [x] Paste screenshot
- [x] Copy image from web browser

### Alignment Tests
- [x] Align left - text wraps properly
- [x] Align center - image centered
- [x] Align right - text wraps properly
- [x] Inline - flows with text
- [x] Wrap text - 50% width, text wraps
- [x] Break text - full width, centered

### Caption Tests
- [x] Add caption to new image
- [x] Edit existing caption
- [x] Remove caption
- [x] Caption styling correct

### Resize Tests
- [x] Drag handles to resize
- [x] Select 25% from dropdown
- [x] Select 50% from dropdown
- [x] Select 75% from dropdown
- [x] Select 100% from dropdown
- [x] Select Original size

### Responsive Tests
- [x] Desktop view (1920x1080)
- [x] Tablet view (768x1024)
- [x] Mobile view (375x667)
- [x] Images don't overflow
- [x] Floats clear on mobile

---

## Benefits Summary

### For Teachers
- ✅ **Easy Paste** - Copy from Google Docs/Word without issues
- ✅ **Consistent Layout** - All images look professional
- ✅ **Full Control** - Multiple alignment options
- ✅ **Professional Captions** - Styled figure captions
- ✅ **Responsive** - Works on all devices

### For Students
- ✅ **Clear Visuals** - Images properly positioned
- ✅ **Readable** - Text doesn't overlap images
- ✅ **Mobile Friendly** - Works on phones and tablets
- ✅ **Accessible** - Proper semantic HTML

### For System
- ✅ **Clean HTML** - No inline Office styles
- ✅ **Performant** - Optimized CSS
- ✅ **Maintainable** - Centralized styles
- ✅ **Consistent** - Same rendering everywhere

---

## Known Limitations

### Image Format Support
- ✅ JPG, PNG, GIF, WebP - Fully supported
- ⚠️ SVG - Supported but may need sanitization
- ❌ HEIC - Not supported in browsers
- ❌ RAW formats - Not supported

### File Size
- Recommended: < 2MB per image
- Maximum: 5MB (Base64 can increase payload)
- Large images auto-converted to URLs via storage

### Google Docs Paste
- ✅ Images pasted correctly
- ✅ Styles cleaned automatically
- ⚠️ Very complex layouts may need manual adjustment
- ⚠️ Tables with images need review

---

## Future Enhancements

### Possible Improvements
1. **Image Gallery** - Multiple images in carousel
2. **Image Comparison** - Before/after sliders
3. **Image Annotations** - Clickable hotspots
4. **Image Zoom** - Click to enlarge
5. **Lazy Loading** - Better performance
6. **WebP Conversion** - Auto-optimize format
7. **Image CDN** - Faster loading

---

## Troubleshooting

### Issue: Image Still Misaligned After Paste

**Solution:**
1. Click the image
2. Click alignment button in toolbar
3. Select "Align Center" or desired style
4. If still wrong, delete and re-upload

### Issue: Caption Not Showing

**Solution:**
1. Click the image
2. Click "Toggle Caption" button in toolbar
3. Caption field should appear below image
4. Type caption text

### Issue: Image Too Large

**Solution:**
1. Click the image
2. Click resize button in toolbar
3. Select 50% or 75%
4. Or drag corner handle to resize manually

### Issue: Text Not Wrapping Around Image

**Solution:**
1. Click the image
2. Change style from "Inline" or "Center"
3. Select "Align Left" or "Align Right"
4. Text should now wrap

---

## Summary

✅ **Images from Google Docs/Word** now paste correctly  
✅ **Proper alignment and positioning** with 7 style options  
✅ **Professional captions** with automatic styling  
✅ **Responsive design** works on all devices  
✅ **Clean HTML** with no Office inline styles  
✅ **Easy to use** with visual toolbar controls  

The image handling system is now **production-ready** and provides teachers with professional-grade image editing capabilities! 🎉📸
