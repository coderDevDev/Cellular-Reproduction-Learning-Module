# Read-Aloud Integration Guide

## Quick Start

Here's how to integrate the Read-Aloud feature into your VARK modules:

---

## Step 1: Update Content Type in Builder

In **`content-structure-step.tsx`**, add "Read Aloud" option:

```typescript
const contentTypes = [
  { value: 'text', label: 'Text Content' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'read_aloud', label: 'Read Aloud (Text-to-Speech)' }, // NEW!
  { value: 'table', label: 'Table' },
  { value: 'diagram', label: 'Diagram' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'activity', label: 'Activity' },
  { value: 'highlight', label: 'Highlight Box' },
  { value: 'quick_check', label: 'Quick Check' }
];
```

---

## Step 2: Add to Preview/Viewer

In **`vark-module-preview.tsx`** or **`dynamic-module-viewer.tsx`**, add the case:

```typescript
import ReadAloudPlayer from '@/components/vark-modules/read-aloud-player';

const renderContentPreview = (section: VARKModuleContentSection) => {
  const { content_type, content_data } = section;

  switch (content_type) {
    case 'text':
      return <TextContent data={content_data.text} />;
    
    case 'video':
      return <VideoPlayer data={content_data.video_data} />;
    
    case 'read_aloud':  // NEW!
      return (
        <ReadAloudPlayer 
          data={content_data.read_aloud_data!}
          onComplete={() => console.log('Read-aloud completed!')}
        />
      );
    
    // ... other cases
  }
};
```

---

## Step 3: Create Content Form (Optional)

Add a form in the builder for teachers to configure read-aloud content:

```typescript
// In content-structure-step.tsx

{selectedSection?.content_type === 'read_aloud' && (
  <div className="space-y-4">
    {/* Title */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Title
      </label>
      <input
        type="text"
        value={selectedSection.content_data.read_aloud_data?.title || ''}
        onChange={(e) => updateReadAloudData('title', e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
        placeholder="e.g., Introduction to Cell Division"
      />
    </div>

    {/* Content (CKEditor) */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Content to Read Aloud
      </label>
      <CKEditorContentEditor
        data={selectedSection.content_data.read_aloud_data?.content || ''}
        onChange={(data) => updateReadAloudData('content', data)}
        placeholder="Enter content that will be read aloud..."
      />
    </div>

    {/* Voice Settings */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Speech Rate
        </label>
        <input
          type="number"
          min="0.5"
          max="2"
          step="0.1"
          value={selectedSection.content_data.read_aloud_data?.voice_settings?.rate || 1}
          onChange={(e) => updateVoiceSettings('rate', parseFloat(e.target.value))}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-xs text-gray-500 mt-1">0.5 (slow) to 2.0 (fast)</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Language
        </label>
        <select
          value={selectedSection.content_data.read_aloud_data?.voice_settings?.language || 'en-US'}
          onChange={(e) => updateVoiceSettings('language', e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="fil-PH">Filipino</option>
          <option value="es-ES">Spanish</option>
        </select>
      </div>
    </div>

    {/* Highlight Settings */}
    <div className="border-t pt-4">
      <h4 className="font-medium mb-3">Highlight Settings</h4>
      
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          id="enable-highlight"
          checked={selectedSection.content_data.read_aloud_data?.highlight_settings?.enabled !== false}
          onChange={(e) => updateHighlightSettings('enabled', e.target.checked)}
          className="w-4 h-4 text-purple-600 rounded"
        />
        <label htmlFor="enable-highlight" className="text-sm">
          Enable word highlighting during read-aloud
        </label>
      </div>

      {selectedSection.content_data.read_aloud_data?.highlight_settings?.enabled !== false && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Highlight Color
            </label>
            <input
              type="color"
              value={selectedSection.content_data.read_aloud_data?.highlight_settings?.color || '#FFD700'}
              onChange={(e) => updateHighlightSettings('color', e.target.value)}
              className="w-full h-10 border rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Animation
            </label>
            <select
              value={selectedSection.content_data.read_aloud_data?.highlight_settings?.animation || 'pulse'}
              onChange={(e) => updateHighlightSettings('animation', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="none">None</option>
              <option value="pulse">Pulse</option>
              <option value="fade">Fade</option>
              <option value="underline">Underline</option>
            </select>
          </div>
        </div>
      )}
    </div>

    {/* Player Controls */}
    <div className="border-t pt-4">
      <h4 className="font-medium mb-3">Player Controls</h4>
      
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedSection.content_data.read_aloud_data?.player_controls?.show_progress !== false}
            onChange={(e) => updatePlayerControls('show_progress', e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm">Show progress bar</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedSection.content_data.read_aloud_data?.player_controls?.show_speed_control}
            onChange={(e) => updatePlayerControls('show_speed_control', e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm">Show speed control</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedSection.content_data.read_aloud_data?.player_controls?.show_voice_selector}
            onChange={(e) => updatePlayerControls('show_voice_selector', e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm">Show voice selector</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedSection.content_data.read_aloud_data?.player_controls?.enable_skip}
            onChange={(e) => updatePlayerControls('enable_skip', e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm">Enable skip buttons</span>
        </label>
      </div>
    </div>

    {/* Accessibility */}
    <div className="border-t pt-4">
      <h4 className="font-medium mb-3">Accessibility</h4>
      
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={selectedSection.content_data.read_aloud_data?.accessibility?.enable_transcript}
          onChange={(e) => updateAccessibility('enable_transcript', e.target.checked)}
          className="w-4 h-4 text-purple-600 rounded"
        />
        <span className="text-sm">Enable transcript toggle</span>
      </label>
    </div>
  </div>
)}
```

---

## Step 4: Test Example

Create a test module with read-aloud content:

```typescript
const testModule: VARKModule = {
  id: '1',
  title: 'Cell Division - Read Aloud Demo',
  content_structure: {
    sections: [
      {
        id: 'section-1',
        title: 'Introduction to Sexual Reproduction',
        content_type: 'read_aloud',
        content_data: {
          read_aloud_data: {
            title: 'Read Aloud: Sexual Reproduction',
            content: `
              <h2>Sexual Reproduction</h2>
              <p>
                Sexual Reproduction is a type of reproduction that 
                <strong>involves two parents</strong> (male and female). 
                Each parent produces reproductive cells called 
                <strong>gametes</strong> (sperm in males and eggs in females) 
                that are formed during meiosis.
              </p>
              <p>
                These gametes (egg cells and sperm cells) unite in a 
                process known as <strong>fertilization</strong>. This union 
                forms a fertilized egg or known as <strong>zygote</strong>, 
                containing genes from both parents.
              </p>
              <p>
                You can observe this process in the diagram below showing 
                how sperm and egg combine to create genetically unique offspring.
              </p>
            `,
            voice_settings: {
              rate: 1.0,
              pitch: 1.0,
              volume: 1.0,
              language: 'en-US'
            },
            highlight_settings: {
              enabled: true,
              color: '#FFD700',
              style: 'word',
              animation: 'pulse'
            },
            player_controls: {
              show_controls: true,
              show_progress: true,
              show_speed_control: true,
              show_voice_selector: true,
              enable_skip: true,
              auto_play: false,
              loop: false
            },
            accessibility: {
              enable_transcript: true,
              skip_hotkey: 'ArrowRight',
              pause_hotkey: 'Space'
            }
          }
        },
        position: 1,
        is_required: true,
        time_estimate_minutes: 3,
        learning_style_tags: ['auditory', 'visual', 'reading_writing'],
        interactive_elements: ['audio_playback'],
        metadata: {
          difficulty: 'beginner',
          key_points: [
            'Sexual reproduction involves two parents',
            'Gametes are reproductive cells',
            'Fertilization creates a zygote'
          ]
        }
      }
    ],
    learning_path: [],
    prerequisites_checklist: [],
    completion_criteria: []
  },
  // ... rest of module config
};
```

---

## Visual Preview

### What Teachers See (Builder):
```
┌─────────────────────────────────────────────┐
│  Content Type: Read Aloud (Text-to-Speech) │
├─────────────────────────────────────────────┤
│                                             │
│  Title: [Introduction to Cell Division]    │
│                                             │
│  Content Editor:                            │
│  ┌───────────────────────────────────────┐ │
│  │ Sexual Reproduction is a type of      │ │
│  │ reproduction that involves two        │ │
│  │ parents...                            │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ⚙️ Voice Settings                          │
│  Rate: [1.0x] Language: [English (US)]     │
│                                             │
│  🎨 Highlight Settings                      │
│  ☑ Enable highlighting                     │
│  Color: [🟡] Animation: [Pulse]             │
│                                             │
│  🎮 Player Controls                         │
│  ☑ Show progress bar                        │
│  ☑ Show speed control                       │
│  ☑ Enable skip buttons                      │
│                                             │
│  ♿ Accessibility                            │
│  ☑ Enable transcript                        │
│                                             │
│  [Preview] [Save]                           │
└─────────────────────────────────────────────┘
```

### What Students See (Player):
```
┌─────────────────────────────────────────────────┐
│ 🎤 Read Aloud: Sexual Reproduction              │
│    Read Aloud with Highlighting                 │
│                                    [Auditory]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Sexual Reproduction is a type of reproduction  │
│  that [involves] two parents (male and female). │
│          ↑                                      │
│  (Currently speaking - highlighted in GOLD)     │
│                                                 │
│  Progress: ████████░░░░░░░░░░░ 45%              │
│                                                 │
│  [◀◀]  [⏸️ Pause]  [⏹️]  [▶▶]                   │
│                                                 │
│  Speed: ●────────── 1.0x                        │
│  Volume: ●────────── 80%                        │
│                                                 │
│  Voice: [Google US English ▼]                  │
│                                                 │
│  [📄 Show Transcript]                           │
│                                                 │
│  Words: 156 • Est. Time: 1 min • ⏯️ Playing     │
└─────────────────────────────────────────────────┘
```

---

## Usage Tips

### For Best Results:

1. **Content Length:** 200-500 words per section
2. **Formatting:** Use headings, bold, lists for structure
3. **Punctuation:** Proper punctuation for natural pauses
4. **Technical Terms:** Test pronunciation first
5. **Speed:** Default 1.0x, allow students to adjust

---

## Common Issues & Solutions

### Issue 1: Voice Not Available
**Solution:** Check browser compatibility, update OS

### Issue 2: Highlighting Not Working
**Solution:** Ensure `highlight_settings.enabled` is true

### Issue 3: Poor Pronunciation
**Solution:** Try different voice, adjust spelling

### Issue 4: No Sound
**Solution:** Check volume settings, unmute device

---

## Summary

✅ **Added** `read_aloud` content type to types  
✅ **Created** `ReadAloudPlayer` component  
✅ **Configured** voice, highlight, player settings  
✅ **Integrated** into module viewer/preview  
✅ **Tested** with sample content  

**The Read-Aloud feature is now ready to use!** 🎉🎤

Teachers can create audio-enhanced lessons with synchronized highlighting, and students can learn through listening while seeing words highlighted in real-time! 📚✨
