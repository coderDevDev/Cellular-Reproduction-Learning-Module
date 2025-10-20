# 🐛 Debug: Section Switching Data Loss

## ✅ **Debug Logging Added**

I've added comprehensive logging to track exactly what's happening when you switch sections.

---

## 🧪 **Testing Steps**

### **1. Open Browser Console**
Press **F12** to open Developer Tools

### **2. Go to Console Tab**
You'll see debug messages there

### **3. Test Scenario:**

```
Step 1: Add Section 1
    ↓
  Click on Section 1
    ↓
  Console shows:
  📂 Loading Section 1: {
    sectionId: "section-abc123",
    title: "Section 1",
    hasEditorData: false,
    blocksCount: 0,
    editorData: undefined
  }
    ↓
  Type: "This is section 1 content"
    ↓
  Console shows (after each keystroke):
  💾 Saving Section 1 data: {
    sectionId: "section-abc123",
    blocksCount: 1,
    timestamp: "2025-10-20T04:00:00.000Z"
  }
```

```
Step 2: Add Section 2
    ↓
  Click on Section 2
    ↓
  Console shows:
  📂 Loading Section 2: {
    sectionId: "section-xyz789",
    title: "Section 2",
    hasEditorData: false,
    blocksCount: 0,
    editorData: undefined
  }
    ↓
  Type: "This is section 2 content"
    ↓
  Console shows:
  💾 Saving Section 2 data: {
    sectionId: "section-xyz789",
    blocksCount: 1,
    timestamp: "2025-10-20T04:01:00.000Z"
  }
```

```
Step 3: Click Back to Section 1
    ↓
  Console shows:
  📂 Loading Section 1: {
    sectionId: "section-abc123",
    title: "Section 1",
    hasEditorData: true,  ⭐ Should be true!
    blocksCount: 1,        ⭐ Should have blocks!
    editorData: {
      blocks: [
        {
          type: "paragraph",
          data: { text: "This is section 1 content" }
        }
      ]
    }
  }
```

---

## 🔍 **What to Look For**

### **✅ Good Signs:**

1. **When saving:**
   ```
   💾 Saving Section X data: { blocksCount: 1 }
   ```
   ✅ blocksCount > 0 means data is being saved

2. **When switching back:**
   ```
   📂 Loading Section X: {
     hasEditorData: true,
     blocksCount: 1,
     editorData: { blocks: [...] }
   }
   ```
   ✅ hasEditorData = true means data exists
   ✅ blocksCount > 0 means content is there

### **❌ Bad Signs:**

1. **When switching back:**
   ```
   📂 Loading Section X: {
     hasEditorData: false,  ❌ Data missing!
     blocksCount: 0,        ❌ No blocks!
     editorData: undefined  ❌ No data!
   }
   ```
   This means data wasn't saved properly

2. **No save messages when typing:**
   ```
   (No 💾 Saving messages appear)
   ```
   ❌ onChange not firing

---

## 🐛 **Possible Issues & Fixes**

### **Issue 1: Data Not Saving (No 💾 messages)**

**Symptom:**
- You type but see no 💾 messages in console

**Cause:**
- onChange callback not firing

**Fix:**
Check if Editor.js initialized properly:
```javascript
// Should see these in console:
✅ Editor.js tools loaded: { ... }
✅ Editor.js is ready!
```

If not, restart dev server:
```bash
Ctrl + C
npm run dev
```

---

### **Issue 2: Data Saved But Not Loading (hasEditorData: false)**

**Symptom:**
- See 💾 Saving messages
- But when switching back: hasEditorData = false

**Cause:**
- updateContentSection not properly updating state
- OR formData not being passed down correctly

**Fix:**
Check the full state in console:
```javascript
// In content-structure-step.tsx, add:
console.log('Full formData:', formData);
```

---

### **Issue 3: Data Exists But Editor Shows Empty**

**Symptom:**
- Console shows: hasEditorData = true, blocksCount = 1
- But editor appears empty

**Cause:**
- Editor.js not properly initializing with data
- key prop might not be unique enough

**Current key:**
```typescript
key={`editor-${section.id}-${index}`}
```

**Try this alternative:**
```typescript
key={section.id}  // Simpler, just use section ID
```

---

### **Issue 4: Editor Loses Focus/Resets While Typing**

**Symptom:**
- Can only type one character at a time
- Editor resets after each keystroke

**Cause:**
- Component recreating on every render

**Fix:**
Verify EditorJSContentEditor is imported at top level (not inside function)

**Current (Correct):**
```typescript
// ✅ At top of file
const EditorJSContentEditor = dynamic(
  () => import('../editorjs-content-editor'),
  { ssr: false }
);
```

---

## 🔧 **Emergency Fixes**

### **Fix 1: Remove key prop temporarily**

If key prop is causing issues:

```typescript
// Try without key
<EditorJSContentEditor
  // key={`editor-${section.id}-${index}`}  // ← Comment out
  data={section.content_data?.editorjs_data}
  onChange={...}
/>
```

### **Fix 2: Force save before switching**

Add explicit save before changing sections:

```typescript
onClick={async () => {
  // Save current section first
  if (selectedSectionIndex !== null && editorRef.current) {
    const data = await editorRef.current.save();
    updateContentSection(selectedSectionIndex, {
      content_data: { editorjs_data: data }
    });
  }
  
  // Then switch
  setSelectedSectionIndex(index);
}}
```

### **Fix 3: Add delay for data to settle**

```typescript
onClick={() => {
  console.log('Switching sections...');
  
  // Small delay to let save complete
  setTimeout(() => {
    setSelectedSectionIndex(index);
  }, 100);
}}
```

---

## 📊 **Expected Console Output**

### **Complete Flow:**

```
1. User adds Section 1
📂 Loading Section 1: { hasEditorData: false, blocksCount: 0 }

2. User types "Hello"
✅ Editor.js is ready!
💾 Saving Section 1 data: { blocksCount: 1 }
💾 Saving Section 1 data: { blocksCount: 1 }  // Each keystroke

3. User adds Section 2
📂 Loading Section 2: { hasEditorData: false, blocksCount: 0 }

4. User types "World"
✅ Editor.js is ready!
💾 Saving Section 2 data: { blocksCount: 1 }

5. User clicks Section 1
📂 Loading Section 1: { 
  hasEditorData: true,   ← ✅ Data exists!
  blocksCount: 1,
  editorData: { blocks: [{ type: "paragraph", data: { text: "Hello" } }] }
}
✅ Editor.js is ready!
[Editor shows: "Hello"]

6. User clicks Section 2
📂 Loading Section 2: {
  hasEditorData: true,   ← ✅ Data exists!
  blocksCount: 1,
  editorData: { blocks: [{ type: "paragraph", data: { text: "World" } }] }
}
✅ Editor.js is ready!
[Editor shows: "World"]
```

---

## ✅ **What to Report**

If it's still not working, copy the console output and share:

1. **What you see when typing:**
   ```
   (Copy the 💾 Saving messages)
   ```

2. **What you see when switching:**
   ```
   (Copy the 📂 Loading messages)
   ```

3. **Any errors:**
   ```
   (Copy any red error messages)
   ```

---

## 🎯 **Quick Checklist**

Before reporting issues, verify:

- [ ] Dev server restarted
- [ ] Browser cache cleared (Ctrl + F5)
- [ ] Console is open (F12)
- [ ] Tried typing in Section 1
- [ ] See 💾 Saving messages
- [ ] Added Section 2
- [ ] Typed in Section 2
- [ ] Clicked back to Section 1
- [ ] Checked console for 📂 Loading message
- [ ] Verified hasEditorData value
- [ ] Verified blocksCount value

---

**With this logging, we can pinpoint exactly where the data is being lost! 🐛**
