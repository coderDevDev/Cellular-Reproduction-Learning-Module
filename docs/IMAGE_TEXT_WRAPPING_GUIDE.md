# 📖 Image Text Wrapping Guide (Textbook Style)

## ✅ **NEW FEATURE: Textbook-Style Image Layouts**

You can now create professional textbook layouts with images and text wrapping around them!

---

## 🎯 **Example: Your Textbook Layout**

### **What You Showed:**
```
┌─────────────────────────────────────────────┐
│  SEXUAL REPRODUCTION IN FLOWERING PLANTS    │
│                                             │
│  In flowering plants, sexual reproduction...│
│  ┌─────────┐                               │
│  │ Flower  │  In male flowers, the         │
│  │ Diagram │  reproductive part is known...│
│  │         │  which include two parts...   │
│  │         │                               │
│  └─────────┘  The anther is responsible... │
│                                             │
│  While in female flowers, the parts are... │
└─────────────────────────────────────────────┘
```

**Now you can do this in CKEditor!** ✅

---

## 🎨 **How to Use**

### **Method 1: Align Left (Most Common)**

1. **Insert your image** in CKEditor
2. **Click on the image**
3. **Image toolbar appears** with alignment options
4. **Click "Align Left"** icon (or "Wrap Text")
5. **Type your text** - it automatically wraps around the right side!

**Result:**
- ✅ Image floats on left
- ✅ Text wraps on right
- ✅ Perfect textbook layout!

---

### **Method 2: Align Right**

Same as above, but click **"Align Right"**

**Result:**
- ✅ Image floats on right
- ✅ Text wraps on left

---

### **Method 3: Center (No Wrapping)**

Click **"Align Center"**

**Result:**
- ✅ Image in center
- ✅ Text above and below
- ✅ No wrapping

---

## 🖼️ **Available Image Styles**

When you click an image in CKEditor, you'll see these options in the toolbar:

| Button | Style | Effect |
|--------|-------|--------|
| **Inline** | In-line | Image within text (small) |
| **Wrap Text** | Left align | Image left, text wraps right ⭐ |
| **Break Text** | Center | Image center, no wrapping |
| **Align Left** | Float left | Image left, text right ⭐ |
| **Align Center** | Center | Image centered |
| **Align Right** | Float right | Image right, text left |

---

## 📐 **Resize Images**

After placing your image:

1. **Click the image**
2. **Look for resize option** in toolbar
3. **Choose size:**
   - 25% (small)
   - 50% (medium) ⭐ Good for textbook style
   - 75% (large)
   - Original (full size)

**Recommended:** 50% for textbook-style layouts

---

## ✍️ **Step-by-Step: Create Your Layout**

### **Example: Flowering Plants Module**

**Step 1: Add Title**
```
Type: "SEXUAL REPRODUCTION IN FLOWERING PLANTS"
Select text → Heading 2
```

**Step 2: Add Introduction Paragraph**
```
Type: "In flowering plants, sexual reproduction occurs through flowers..."
```

**Step 3: Insert Image**
```
Click "Upload Image" button
Select your flower diagram
```

**Step 4: Position Image**
```
Click on uploaded image
Click "Align Left" in image toolbar
Click "Resize" → Select "50%"
```

**Step 5: Add Caption (Optional)**
```
Click "Toggle Image Caption"
Type: "Figure 3.4 Parts of the Perfect Flower"
```

**Step 6: Continue Writing**
```
Type next paragraph: "In male flowers, the reproductive part..."
Text automatically wraps around the image! ✅
```

**Step 7: Add More Paragraphs**
```
Keep typing paragraphs
Text continues wrapping until image ends
Then text returns to full width
```

---

## 🎯 **Result**

```html
<h2>SEXUAL REPRODUCTION IN FLOWERING PLANTS</h2>

<p>In flowering plants, sexual reproduction occurs through flowers...</p>

<img 
  src="flower-diagram.jpg" 
  class="image-style-align-left" 
  style="width: 50%"
  alt="Flower parts"
/>
<figcaption>Figure 3.4 Parts of the Perfect Flower</figcaption>

<p>In male flowers, the reproductive part is known as the stamen...</p>
<p>The anther is responsible for creating pollen grains...</p>
<p>While in female flowers, the reproductive parts are...</p>
```

**Displays as:**
- ✅ Image on left (50% width)
- ✅ Text wrapping on right
- ✅ Caption below image
- ✅ Professional textbook layout!

---

## 💡 **Pro Tips**

### **1. Image Size**
```
For text wrapping:
- Too small (25%): Hard to see details
- ✅ Just right (50%): Perfect balance
- Too large (75%): Not enough text space
```

### **2. Image Position**
```
Left align: Traditional textbook style ⭐
Right align: Good for variety
Center: For important diagrams
```

### **3. Paragraphs**
```
Write 2-3 paragraphs per image
Let text wrap naturally
Don't force spacing
```

### **4. Captions**
```
Always add captions for clarity:
"Figure 3.4 Parts of the Perfect Flower"
"Diagram 1: Cell Division Process"
"Image 2.1: Photosynthesis Cycle"
```

### **5. Multiple Images**
```
Alternate left and right:
- Image 1: Left align
- Image 2: Right align
- Image 3: Left align
Creates visual variety!
```

---

## 📱 **Mobile Responsive**

On mobile devices (phones/tablets):
- ✅ Images automatically stack
- ✅ No text wrapping (too cramped)
- ✅ Images display full width
- ✅ Better reading experience

**You don't need to do anything - it's automatic!**

---

## 🧪 **Try It Now!**

### **Quick Test:**

1. **Go to Module Builder**
2. **Step 2: Add Content Section**
3. **In CKEditor:**
   ```
   Type: "Cell Division Process"
   Make it Heading 2
   
   Type paragraph: "Cell division is the process by which..."
   
   Click "Upload Image"
   Upload cell diagram
   
   Click image → "Align Left"
   Click image → "Resize 50%"
   
   Type more paragraphs:
   "The process involves several stages..."
   "First, the DNA replicates..."
   ```

4. **Click "Preview"**
5. **See textbook-style layout!** 🎉

---

## ✅ **Before/After**

### **Before (Old):**
```
┌─────────────────────────────┐
│                             │
│        [Image centered]     │
│                             │
├─────────────────────────────┤
│  Paragraph 1                │
│                             │
│  Paragraph 2                │
└─────────────────────────────┘
```
❌ Wasted space  
❌ Not professional  
❌ Doesn't look like textbook  

### **After (New):**
```
┌─────────────────────────────┐
│  ┌────────┐  Paragraph 1    │
│  │ Image  │  continues here │
│  │        │  and wraps      │
│  └────────┘  naturally      │
│                             │
│  Paragraph 2 full width     │
└─────────────────────────────┘
```
✅ Professional layout  
✅ Space efficient  
✅ Textbook quality!  

---

## 🎨 **Advanced Layouts**

### **Layout 1: Diagram with Details**
```
[Image Left 50%]  "The diagram shows three main parts:
                  1. The cell membrane
                  2. The nucleus
                  3. The cytoplasm
                  
                  Each part has a specific function..."
```

### **Layout 2: Process Steps**
```
[Image Left 40%]  "Step 1: Prepare the solution
                  Step 2: Heat to 80°C
                  Step 3: Add catalyst
                  
                  Observe the reaction..."
```

### **Layout 3: Comparison**
```
"Before treatment:"
[Image Left 50%]  "The sample shows...
                  Notice the irregular...
                  Compare this to..."

"After treatment:"
[Image Right 50%] "The improved sample...
                  Clear differences...
                  Results indicate..."
```

---

## 📊 **Image Toolbar Options**

When you click an image, you'll see this toolbar:

```
┌─────────────────────────────────────────────┐
│ [Inline] [Wrap] [Break] | [←] [↔] [→] | ... │
└─────────────────────────────────────────────┘
   Styles          Alignment      More

Inline   = Small, in text
Wrap     = Left with wrap ⭐
Break    = Center, no wrap
←        = Align left
↔        = Align center  
→        = Align right
```

---

## ✅ **Summary**

**To create textbook-style layouts:**

1. ✅ Insert image
2. ✅ Click "Align Left" (or "Wrap Text")
3. ✅ Resize to 50%
4. ✅ Add caption
5. ✅ Type paragraphs - they wrap automatically!

**Result:** Professional textbook layout! 📖

---

## 🎉 **You're Ready!**

Now you can create beautiful, professional educational content that looks just like a textbook!

**Try it in your next module! 🚀**

---

**Last Updated:** October 20, 2025  
**Feature:** Image Text Wrapping  
**Status:** ✅ Active  
**Recommended:** Align Left @ 50% width
