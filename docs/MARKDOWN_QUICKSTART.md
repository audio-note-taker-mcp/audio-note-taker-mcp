# Markdown Mode - Quick Start Guide

## 🎯 What is Markdown Mode?

Markdown Mode transforms your Jott.AI voice notes into a **single, continuously-updated Markdown document** instead of separate tasks, events, and notes. It's perfect for:

- Natural note-taking workflows
- Creating documentation from voice
- Building meeting notes iteratively
- Journaling with structure
- Project planning with flexibility

## 🚀 Getting Started

### 1. Start the App
```bash
npm run dev
```

### 2. Select Markdown Mode
Click the green **"📝 Markdown Mode (Document)"** button at the top of the page.

### 3. Record Your First Note
Click "Record Audio" and speak naturally:
> "I need to prepare for the client meeting on Friday. Research their company, prepare a demo, and create a presentation."

### 4. View Your Document
You'll see a beautifully formatted Markdown document with:
```markdown
# My Notes

## Tasks
- [ ] Prepare for client meeting (due: 2025-10-20) [priority: high]
  - [ ] Research their company
  - [ ] Prepare a demo
  - [ ] Create a presentation
```

### 5. Update Your Document
Click "Add Another Recording" and continue:
> "Actually, add reviewing the contract to the meeting prep. And the meeting is at 2 PM."

Your document intelligently updates:
```markdown
# My Notes

## Tasks
- [ ] Prepare for client meeting (due: 2025-10-20 @ 14:00) [priority: high]
  - [ ] Research their company
  - [ ] Prepare a demo
  - [ ] Create a presentation
  - [ ] Review the contract
```

## 📝 What You Can Say

### Adding Tasks
- "I need to buy groceries tomorrow"
- "Remind me to call mom on Thursday"
- "Add a task to review the budget"

### Completing Tasks
- "I finished the report"
- "Mark the groceries as done"
- "Check off the budget review"

### Updating Tasks
- "Move the dentist appointment to next week"
- "Change the deadline to Friday"
- "Add a subtask to include charts in the report"

### Deleting Tasks
- "Remove the grocery task"
- "Cancel the 3 PM meeting"
- "Scratch that last item"

### Adding Events
- "Schedule a meeting with John on Monday at 10 AM"
- "I have a dentist appointment on the 25th"

### Adding Notes
- "Note that the office will be closed next week"
- "Remember the client prefers email communication"

## 🎨 Markdown Features

The generated document supports:

### Headings
```markdown
# Main Title
## Section
### Subsection
```

### Task Lists
```markdown
- [ ] Incomplete task
- [x] Completed task
  - [ ] Nested subtask
```

### Formatting
```markdown
**Bold text**
*Italic text*
- Bulleted lists
1. Numbered lists
```

### Metadata
```markdown
(due: YYYY-MM-DD)
[priority: high/medium/low]
@ HH:MM
```

## 💾 Exporting Your Notes

### Copy to Clipboard
Click the blue **"Copy Markdown"** button to copy the entire document.

### Download File
Click the green **"Download .md"** button to save as a `.md` file you can open in any text editor.

### View Raw Source
Scroll down to see the raw Markdown source code below the rendered view.

## 🔄 Session Management

### Active Session
- Each recording adds to your document
- Session counter shows how many recordings you've made
- Document grows iteratively with each addition

### Reset Session
Click **"Reset Session"** to:
- Clear the current document
- Start fresh with a new note
- Create a new storage file

### Continue Recording
Click **"Add Another Recording"** to:
- Keep the current document
- Update it with new voice input
- Maintain context across recordings

## 📦 Storage

Your Markdown notes are saved as:
- **`note_[timestamp]_[id].md`** - The Markdown document
- **`note_[timestamp]_[id].meta.json`** - Metadata (transcript, timestamps)

Storage location (based on environment variables):
- **S3**: `s3://your-bucket/notes/note_*.md`
- **Local**: `./data/notes/note_*.md`

## 🔀 Switching Between Modes

### JSON Mode
- Structured tasks, events, and notes
- Colored cards UI
- Google Calendar integration
- Best for: Task management

### Markdown Mode
- Single document
- Rendered + raw views
- Human-readable format
- Best for: Note-taking

**Note**: Switching modes resets your session to prevent data conflicts.

## 🔧 Pro Tips

### 1. Be Specific with Dates
Instead of: "tomorrow"
Say: "October 18th" or "next Friday"

### 2. Use Priority Keywords
- "urgent" → priority: high
- "important" → priority: high
- "when I have time" → priority: low

### 3. Organize with Sections
Say: "Under project notes, add that we need more budget"
Claude will create custom sections as needed.

### 4. Reference Previous Items
- "Update that meeting time to 3 PM"
- "Add milk to the grocery list"
- "Mark the first task as done"

### 5. Batch Multiple Items
> "I need to do three things: finish the report, email the team, and schedule a follow-up. The report is due Friday."

## 🐛 Troubleshooting

### Document Not Updating
- Check that you're in Markdown Mode (green button active)
- Verify the previous recording completed successfully
- Try "Reset Session" and start fresh

### Tasks Not Formatting Correctly
- Use clear language: "I need to..." or "Remind me to..."
- Mention specific dates and times
- Speak naturally, don't over-structure

### Can't Find My Notes
- Check `./data/notes/` directory
- Look for `.md` files with recent timestamps
- Check server logs for storage location

## 📱 Example Workflows

### Meeting Notes
```
Recording 1: "Team standup for Project X on October 18th"
Recording 2: "Action items: John will update the database schema"
Recording 3: "Sarah will review the API documentation by Friday"
Recording 4: "Next meeting is scheduled for Monday at 10 AM"
```

### Project Planning
```
Recording 1: "New feature: User authentication"
Recording 2: "Break it down: design the login page, implement OAuth, add password reset"
Recording 3: "Add testing: unit tests for auth service, integration tests for login flow"
Recording 4: "Deadline is end of sprint, which is November 1st"
```

### Personal Journal
```
Recording 1: "Today I learned about Markdown Mode in Jott.AI"
Recording 2: "It's much more natural than structured tasks"
Recording 3: "I can see using this for daily reflections"
```

## 🎓 Learning Resources

- **Markdown Syntax**: https://www.markdownguide.org/
- **Task List Format**: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/about-task-lists
- **Date Formats**: Use natural language or ISO format (YYYY-MM-DD)

## 🆚 When to Use Each Mode

### Use Markdown Mode When:
- ✅ Taking freeform notes
- ✅ Building a document iteratively
- ✅ Need human-readable output
- ✅ Want flexibility in structure
- ✅ Creating meeting minutes
- ✅ Journaling or brainstorming

### Use JSON Mode When:
- ✅ Managing structured tasks
- ✅ Need calendar integration
- ✅ Want priority color-coding
- ✅ Tracking specific events
- ✅ Exporting to task management tools

## 📞 Need Help?

Check these files for more details:
- **[MARKDOWN_IMPLEMENTATION.md](MARKDOWN_IMPLEMENTATION.md)** - Technical details
- **[MARKDOWN_MIGRATION.md](MARKDOWN_MIGRATION.md)** - Migration plan and architecture

---

**Happy note-taking! 🎤📝**
