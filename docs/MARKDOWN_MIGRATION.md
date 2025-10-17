# MARKDOWN_MIGRATION.md

## Goal

Migrate the app from extracting and merging structured JSON (tasks, events, notes) to maintaining a single Markdown document that the LLM updates iteratively. The Markdown document should serve as the user's evolving note, with all actionable items, events, and general notes embedded in a readable, editable format.

---

## Current State

- The app uses `getTaskExtractionPrompt` to instruct the LLM to extract and merge tasks, events, and notes from transcripts, returning a JSON object.
- The backend merges new items with previous state, and the UI displays lists of tasks, events, and notes.
- Each session/note is stored as a JSON file with arrays for `tasks`, `events`, and `notes`.

---

## Target State

- The LLM receives the current Markdown document (or an empty doc for the first entry) and the new transcript.
- The LLM updates the Markdown document, adding, modifying, or removing content as needed based on the new transcript.
- The backend stores and serves a single Markdown file per note/session.
- The UI displays the Markdown document directly, possibly with live preview and editing.

---

## Required Changes

### 1. Prompt Engineering

- Replace `getTaskExtractionPrompt` with a new function (e.g., `getMarkdownUpdatePrompt`) that:
  - Provides the current Markdown document as context.
  - Instructs the LLM to update the Markdown with new/changed information from the transcript.
  - Specifies Markdown formatting guidelines (e.g., use headings for tasks/events, checkboxes for tasks, etc.).
  - Requests the LLM to return ONLY the updated Markdown document (no JSON).

### 2. Data Model

- Replace the `PreviousState` interface and all JSON-based merging logic with a single Markdown string.
- Update storage logic to save and load `.md` files instead of `.json` files for notes.

### 3. Backend Logic

- Update the `extractTasks` (or new `updateMarkdownNote`) function to:
  - Pass the current Markdown and new transcript to the LLM.
  - Parse and store the returned Markdown.
- Remove or refactor fallback extraction logic to work with Markdown if LLM is unavailable.

### 4. API Changes

- Update API endpoints to:
  - Accept and return Markdown documents.
  - Remove references to tasks/events/notes arrays in API contracts.

### 5. UI Changes

- Replace task/event/note list displays with a Markdown viewer/editor.
- Optionally, provide controls for editing Markdown directly or via voice.
- Add support for rendering checkboxes, headings, and other Markdown features.

### 6. Migration of Existing Data

- Provide a script or migration tool to convert existing JSON notes to Markdown format.
- Example: Convert tasks to a checklist, events to a schedule section, notes to bullet points or paragraphs.

---

## Example Markdown Structure

```
# My Audio Note

## Tasks
- [ ] Buy milk (due: 2025-10-18)
- [x] Finish the report

## Events
- Team sync: 2025-10-21 @ 14:00

## Notes
- Remember to review the analytics dashboard.
```

---

## Next Steps

- Design the new prompt for Markdown updates.
- Refactor backend and UI to use Markdown as the single source of truth.
- Test iterative updates and merging in Markdown format.
- Update documentation and onboarding materials.
