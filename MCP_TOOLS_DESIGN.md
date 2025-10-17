# MCP Tools Design for Audio Note Taker

## Overview
We'll create 4 core MCP tools that Claude will chain together to process voice notes.

---

## Tool 1: `transcribe_audio`

**Purpose**: Transcribe audio file using Deepgram

**Input Parameters**:
```typescript
{
  audio_url: string;  // S3 URL or data URL of audio
}
```

**Output**:
```typescript
{
  transcript: string;
  duration: number;
  confidence: number;
}
```

**Implementation**:
- Call Deepgram API
- Handle audio from S3 URL or base64 data URL
- Return transcript text

---

## Tool 2: `extract_tasks`

**Purpose**: Parse transcript for actionable items (tasks, events, reminders)

**Input Parameters**:
```typescript
{
  transcript: string;
  context?: string;  // Optional user context
}
```

**Output**:
```typescript
{
  tasks: Array<{
    title: string;
    description: string;
    due_date?: string;
    priority?: 'low' | 'medium' | 'high';
  }>;
  events: Array<{
    title: string;
    date: string;
    time?: string;
    description?: string;
  }>;
  notes: Array<{
    content: string;
    category?: string;
  }>;
}
```

**Implementation**:
- Use Claude API to analyze transcript
- Extract structured data (tasks, calendar events, notes)
- Return categorized items

---

## Tool 3: `save_note`

**Purpose**: Store processed note to S3/database

**Input Parameters**:
```typescript
{
  transcript: string;
  tasks: object[];
  events: object[];
  notes: object[];
  audio_url?: string;
  metadata?: {
    timestamp: string;
    duration: number;
  };
}
```

**Output**:
```typescript
{
  note_id: string;
  storage_url: string;
  created_at: string;
}
```

**Implementation**:
- Save to S3 or simple JSON file (for demo)
- Generate unique ID
- Store all extracted data

---

## Tool 4: `create_calendar_event` (Stretch)

**Purpose**: Create calendar events from extracted data

**Input Parameters**:
```typescript
{
  title: string;
  date: string;
  time?: string;
  description?: string;
}
```

**Output**:
```typescript
{
  event_id: string;
  calendar_link: string;
}
```

**Implementation**:
- Mock implementation for demo (return formatted data)
- Could integrate with Google Calendar API if time permits

---

## Workflow Example

**User says**: "Remind me to follow up with Sarah about Q4 budget by Friday and schedule team sync next Tuesday at 2pm"

**Claude's Tool Chain**:
1. `transcribe_audio(audio_url)`
   → Returns transcript text

2. `extract_tasks(transcript)`
   → Returns:
   ```json
   {
     "tasks": [{
       "title": "Follow up with Sarah about Q4 budget",
       "due_date": "2025-10-22",
       "priority": "medium"
     }],
     "events": [{
       "title": "Team sync",
       "date": "2025-10-19",
       "time": "14:00"
     }]
   }
   ```

3. `save_note(transcript, tasks, events, ...)`
   → Returns note_id and storage URL

4. `create_calendar_event(events[0])`
   → Returns calendar event link

---

## Implementation Priority

### Phase 1 (MVP):
1. ✅ `transcribe_audio` - Core functionality
2. ✅ `extract_tasks` - Core functionality
3. ✅ `save_note` - Simple file storage

### Phase 2 (If time):
4. `create_calendar_event` - Mock or real integration

---

## Dependencies to Add

```json
{
  "@deepgram/sdk": "^3.x",
  "@aws-sdk/client-s3": "^3.x",
  "@anthropic-ai/sdk": "^0.x"
}
```

---

## Environment Variables Needed

```env
DEEPGRAM_API_KEY=xxx
ANTHROPIC_API_KEY=xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=audio-notes-bucket
```

---

## Next Steps

1. Install dependencies
2. Create `.env.local` file
3. Implement tools in `app/mcp/route.ts`
4. Create frontend UI for audio recording
5. Test end-to-end workflow
