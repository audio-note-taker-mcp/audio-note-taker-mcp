# Demo Planning Document

## Project Status Overview

**Current State:** 🎉 FUNCTIONAL DEMO COMPLETE! Backend + Frontend fully implemented ✅

**Last Updated:** 2025-10-17 (Updated after implementation)

---

## What We Have

### Backend (MCP Server)

- **Location:** [app/mcp/route.ts](app/mcp/route.ts)
- **Status:** ✅ Fully implemented
- **MCP Tools:**
  1. `transcribe_audio` - Deepgram speech-to-text integration
  2. `extract_tasks` - Claude AI for extracting tasks/events/notes
  3. `save_note` - S3/local filesystem storage
  4. `create_calendar_event` - Google Calendar link generation

### Landing Page

- **Location:** [app/page.tsx](app/page.tsx)
- **Status:** ✅ Complete informational homepage
- **Features:**
  - Workflow explanation
  - MCP tools showcase
  - "Try Demo" button → `/demo` (doesn't exist yet)

### Infrastructure

- ✅ All dependencies installed
- ✅ Dev server running (multiple instances detected)
- ✅ TypeScript configuration
- ✅ Tailwind CSS v4 configured
- ✅ `.env.local` created)

---

## What We Need

### 1. Demo Page (`/app/demo/page.tsx`)

**Purpose:** Interactive interface for users to test the audio note-taking workflow

#### Required Features:

##### A. Audio Input Section

- **Option 1:** Browser audio recording

  - MediaRecorder API
  - Real-time waveform visualization (optional)
  - Start/Stop recording buttons
  - Audio preview playback

##### B. Processing Workflow Display

- Loading states for each step:
  1. "Transcribing audio..." (Deepgram)
  2. "Extracting tasks..." (Claude AI)
  3. "Saving note..." (Storage)
  4. "Creating events..." (Calendar)
- Progress indicators
- Error handling UI

##### C. Results Display

```
┌─────────────────────────────────────┐
│ 📝 TRANSCRIPT                       │
│ [Show full transcribed text]        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✅ TASKS (X found)                  │
│ • Task 1 [Priority] [Due: Date]     │
│ • Task 2 [Priority] [Due: Date]     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📅 EVENTS (X found)                 │
│ • Event 1 - Date @ Time             │
│   [Add to Google Calendar] button   │
│ • Event 2 - Date @ Time             │
│   [Add to Google Calendar] button   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📓 NOTES (X found)                  │
│ • Note 1 (Category)                 │
│ • Note 2 (Category)                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💾 STORAGE                          │
│ Note ID: note_xxxxx                 │
│ Saved: timestamp                    │
│ Location: file:// or s3://          │
└─────────────────────────────────────┘
```

##### D. Action Buttons

- Copy results to clipboard
- Download as JSON
- Try another recording
- Export to todo list app (future)

---

### 2. API Route for Demo (`/app/api/process-audio/route.ts`)

**Purpose:** Orchestrate the MCP tool chain from frontend

```typescript
POST /api/process-audio
Body: { audioData: string (base64), mimeType: string }

Response: {
  success: boolean,
  transcript: string,
  tasks: Task[],
  events: Event[],
  notes: Note[],
  storageInfo: { noteId, url, timestamp },
  calendarLinks: string[]
}
```

**Implementation Steps:**

1. Receive audio data from frontend
2. Call MCP transcribe_audio tool
3. Call MCP extract_tasks tool
4. Call MCP save_note tool
5. Call MCP create_calendar_event tool for each event
6. Return consolidated results

---

### 3. Environment Setup

**File:** `.env.local` (copy from `.env.example`)

```env
# Required for demo
DEEPGRAM_API_KEY=<get_from_console.deepgram.com>
ANTHROPIC_API_KEY=<get_from_console.anthropic.com>

# Optional (demo will use local storage if not set)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=audio-notes-bucket
```

**⚠️ SECURITY NOTE:**

- The current `.env.example` contains what appear to be real API keys
- **ACTION REQUIRED:** Rotate those keys immediately
- Never commit `.env.local` to git (already in `.gitignore`)

---

### 4. Additional Components Needed

#### `/app/components/AudioRecorder.tsx`

- Browser MediaRecorder wrapper
- Recording state management
- Audio blob handling
- Convert to base64 for API

#### `/app/components/WorkflowProgress.tsx`

- Step-by-step progress display
- Loading animations
- Error states

#### `/app/components/ResultsDisplay.tsx`

- Transcript display
- Tasks list with priority badges
- Events with calendar buttons
- Notes categorization
- Storage info

---

## Demo User Flow

```
1. User lands on homepage (/)
   ↓
2. Clicks "Try Demo"
   ↓
3. Arrives at /demo
   ↓
4. Chooses recording OR upload
   ↓
5. [If recording] Records voice note
   [If upload] Selects audio file
   ↓
6. Clicks "Process Audio"
   ↓
7. Sees workflow progress:
   - ⏳ Transcribing...
   - ⏳ Extracting tasks...
   - ⏳ Saving note...
   - ⏳ Creating calendar events...
   ↓
8. Results appear:
   - Transcript displayed
   - Tasks listed with due dates
   - Events with calendar links
   - Notes categorized
   - Storage confirmation
   ↓
9. User can:
   - Click calendar links to add events
   - Copy results
   - Download JSON
   - Try another recording
```

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Browser (Frontend)                  │
│  /demo page with AudioRecorder/FileUploader         │
└─────────────────────┬───────────────────────────────┘
                      │ POST audio data (base64)
                      ↓
┌─────────────────────────────────────────────────────┐
│            Next.js API Route                         │
│         /api/process-audio/route.ts                  │
│  (Orchestrates MCP tool chain)                       │
└─────────────────────┬───────────────────────────────┘
                      │ Calls MCP tools
                      ↓
┌─────────────────────────────────────────────────────┐
│              MCP Server Handler                      │
│             /app/mcp/route.ts                        │
│  (4 tools: transcribe, extract, save, calendar)     │
└─────────┬───────────┬───────────┬───────────────────┘
          │           │           │
          ↓           ↓           ↓
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │Deepgram │ │Claude AI│ │S3/Local │
    │   API   │ │   API   │ │ Storage │
    └─────────┘ └─────────┘ └─────────┘
```

---

## Sample Test Scenarios

### Test Case 1: Simple Task

**Audio:** "Remind me to buy milk tomorrow"

**Expected Output:**

- **Transcript:** "Remind me to buy milk tomorrow"
- **Tasks:**
  - Title: "Buy milk"
  - Due: [tomorrow's date]
  - Priority: medium
- **Events:** []
- **Notes:** []

### Test Case 2: Meeting Schedule

**Audio:** "Schedule a team sync next Tuesday at 2pm to discuss Q4 goals"

**Expected Output:**

- **Transcript:** "Schedule a team sync next Tuesday at 2pm to discuss Q4 goals"
- **Tasks:** []
- **Events:**
  - Title: "Team sync"
  - Date: [next Tuesday]
  - Time: "14:00"
  - Description: "Discuss Q4 goals"
  - Calendar Link: [Google Calendar URL]
- **Notes:** []

### Test Case 3: Complex Note

**Audio:** "Follow up with Sarah about Q4 budget by Friday. Also schedule team sync Tuesday at 2pm. Remember to review the analytics dashboard, we need better metrics."

**Expected Output:**

- **Tasks:**
  - "Follow up with Sarah about Q4 budget" (due: Friday, high priority)
- **Events:**
  - "Team sync" (Tuesday 14:00)
- **Notes:**
  - "Review analytics dashboard - need better metrics" (category: reminder)

---

## Priority Implementation Order

### Phase 1: MVP Demo (Minimum Viable Product)

1. ✅ Create `.env.local` with API keys
2. ✅ Create `/app/demo/page.tsx` basic layout
3. ✅ Create `/app/api/process-audio/route.ts`
4. ✅ Implement file upload (easier than recording)
5. ✅ Display basic results
6. ✅ Test with sample audio files

### Phase 2: Polish

7. ⬜ Add audio recording capability
8. ⬜ Improve UI/UX with animations
9. ⬜ Add copy/download features
10. ⬜ Better error handling
11. ⬜ Loading states

### Phase 3: Enhancement

12. ⬜ Real-time progress streaming
13. ⬜ Audio waveform visualization
14. ⬜ History of processed notes
15. ⬜ Dark/light mode toggle
16. ⬜ Export to external todo apps

---

## Known Issues & Considerations

### Current Blockers

1. ❌ No `.env.local` - demo won't work without API keys
2. ❌ No demo page - users can't test the system
3. ⚠️ Potential API key leak in `.env.example`

### Technical Considerations

1. **Audio Format:** Browser MediaRecorder typically outputs WebM/Opus or MP4

   - Need to ensure Deepgram supports the format
   - May need conversion layer

2. **File Size Limits:**

   - Next.js default: 4.5MB body size limit
   - May need to adjust for longer audio recordings
   - Consider chunking for large files

3. **API Timeouts:**

   - Deepgram: typically 2-5 seconds for 1min audio
   - Claude: 1-3 seconds for extraction
   - Total: ~10-15 seconds for full workflow
   - Need proper timeout handling

4. **Error Scenarios:**

   - Invalid API keys
   - Unsupported audio format
   - Network failures
   - API rate limits
   - Malformed audio data

5. **Browser Compatibility:**
   - MediaRecorder API: Chrome, Firefox, Safari 14.1+
   - Fallback to file upload for unsupported browsers

---

## Success Metrics

### Demo is "Done" When:

- ✅ User can upload or record audio
- ✅ Audio is successfully transcribed
- ✅ Tasks, events, and notes are extracted
- ✅ Results are displayed clearly
- ✅ Calendar links work
- ✅ Notes are saved (local or S3)
- ✅ User can try multiple times without errors

### Bonus Points:

- ⭐ Real-time progress updates
- ⭐ Beautiful UI animations
- ⭐ Mobile responsive
- ⭐ Shareable results
- ⭐ Export functionality

---

## Next Steps

1. **Immediate:** Create `.env.local` with valid API keys
2. **Today:** Build basic demo page with file upload
3. **Today:** Create API orchestration route
4. **Tomorrow:** Polish UI and test thoroughly
5. **Deploy:** Push to Vercel/Amplify for live demo

---

## Resources

- **Deepgram Docs:** https://developers.deepgram.com/
- **Anthropic Docs:** https://docs.anthropic.com/
- **MCP Specification:** https://modelcontextprotocol.io/
- **Next.js App Router:** https://nextjs.org/docs/app
- **MediaRecorder API:** https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

---

## Questions to Resolve

1. Do we want live audio recording or just file upload for MVP?
2. Should we show raw JSON response or just formatted results?
3. Do we need authentication/user accounts or is this open demo?
4. Should notes be publicly accessible or private?
5. Do we want to track usage/analytics?
6. What audio formats should we support?
7. Max audio duration limit?

---

**Status:** Ready to start implementation 🚀
**Estimated Time to MVP:** 4-6 hours
**Estimated Time to Polished Demo:** 8-12 hours
