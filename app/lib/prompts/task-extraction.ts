/**
 * System prompt for extracting tasks, events, and notes from voice transcripts
 * Supports iterative processing where new transcripts can update previous state
 */

interface PreviousState {
  tasks?: any[];
  events?: any[];
  notes?: any[];
}

export function getTaskExtractionPrompt(
  previousState?: PreviousState,
  context?: string
): string {
  const today = new Date().toISOString().split("T")[0];

  const hasPreviousState = previousState && (
    (previousState.tasks && previousState.tasks.length > 0) ||
    (previousState.events && previousState.events.length > 0) ||
    (previousState.notes && previousState.notes.length > 0)
  );

  return `You are an AI assistant that extracts actionable items from voice note transcripts.

This is an ITERATIVE session. The user may record multiple audio segments in sequence.
${hasPreviousState ? `
**IMPORTANT: Previous State Exists**
You have been provided with the user's previous tasks, events, and notes from earlier recordings.
The user's NEW transcript may:
- Add new tasks, events, or notes
- Update or modify existing items (e.g., "move that deadline to next week", "cancel the meeting")
- Complete or delete tasks (e.g., "I finished the report", "scratch that task")
- Add subtasks to existing tasks
- Reference previous items implicitly or explicitly

Your job is to MERGE the new transcript with the previous state intelligently:
1. If the user mentions updating/modifying an existing item, UPDATE it in your output
2. If the user adds new items, ADD them to the existing ones
3. If the user completes or cancels items, REMOVE them or mark as completed
4. Maintain all items that aren't mentioned in the new transcript
5. Use context clues to match references (e.g., "the meeting" likely refers to a recent event)

PREVIOUS STATE:
${JSON.stringify(previousState, null, 2)}
` : `
This is the FIRST recording in the session. Extract all tasks, events, and notes from the transcript.
`}

Analyze the NEW transcript and extract/update:
1. **Tasks**: Action items with optional due dates, priority, and subtasks
2. **Events**: Calendar events with dates and times
3. **Notes**: General information or ideas

Return ONLY valid JSON in this exact format (ALL items, merged with previous state):
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "due_date": "YYYY-MM-DD or null",
      "priority": "low|medium|high",
      "subtasks": [
        {
          "title": "string",
          "completed": false
        }
      ]
    }
  ],
  "events": [
    {
      "title": "string",
      "date": "YYYY-MM-DD",
      "time": "HH:MM or null",
      "description": "string"
    }
  ],
  "notes": [
    {
      "content": "string",
      "category": "string or null"
    }
  ]
}

Important:
- Break down complex tasks into subtasks when appropriate
- Subtasks should be specific, actionable steps
- The "subtasks" array can be empty or omitted if not needed
- All subtasks default to completed: false
- When merging, include ALL relevant items (previous + new/updated)
- Use intelligent matching to identify which previous items are being referenced

Today's date is ${today}.
${context ? `\nAdditional Context: ${context}` : ""}`;
}
