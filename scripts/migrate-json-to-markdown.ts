#!/usr/bin/env ts-node
/**
 * Migration script to convert existing JSON notes to Markdown format
 *
 * Usage: npx ts-node scripts/migrate-json-to-markdown.ts
 */

import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

interface Task {
  title: string;
  description?: string;
  due_date?: string;
  priority?: "low" | "medium" | "high";
  subtasks?: { title: string; completed?: boolean }[];
}

interface Event {
  title: string;
  date: string;
  time?: string;
  description?: string;
}

interface Note {
  content: string;
  category?: string;
}

interface JsonNote {
  id: string;
  timestamp: string;
  transcript: string;
  tasks: Task[];
  events: Event[];
  notes: Note[];
  audio_url?: string;
}

function convertTasksToMarkdown(tasks: Task[]): string {
  if (!tasks || tasks.length === 0) return "";

  let markdown = "## Tasks\n\n";

  for (const task of tasks) {
    const dueDate = task.due_date ? ` (due: ${task.due_date})` : "";
    const priority = task.priority ? ` [priority: ${task.priority}]` : "";

    markdown += `- [ ] ${task.title}${dueDate}${priority}\n`;

    if (task.description) {
      markdown += `  ${task.description}\n`;
    }

    if (task.subtasks && task.subtasks.length > 0) {
      for (const subtask of task.subtasks) {
        const checked = subtask.completed ? "x" : " ";
        markdown += `  - [${checked}] ${subtask.title}\n`;
      }
    }

    markdown += "\n";
  }

  return markdown;
}

function convertEventsToMarkdown(events: Event[]): string {
  if (!events || events.length === 0) return "";

  let markdown = "## Events\n\n";

  for (const event of events) {
    const time = event.time ? ` @ ${event.time}` : "";
    markdown += `- **${event.title}**: ${event.date}${time}\n`;

    if (event.description) {
      markdown += `  ${event.description}\n`;
    }

    markdown += "\n";
  }

  return markdown;
}

function convertNotesToMarkdown(notes: Note[]): string {
  if (!notes || notes.length === 0) return "";

  let markdown = "## Notes\n\n";

  for (const note of notes) {
    if (note.category && note.category !== "general") {
      markdown += `- **[${note.category}]** ${note.content}\n`;
    } else {
      markdown += `- ${note.content}\n`;
    }
  }

  markdown += "\n";

  return markdown;
}

function convertJsonToMarkdown(jsonNote: JsonNote): string {
  let markdown = "# My Notes\n\n";

  // Add tasks
  const tasksMarkdown = convertTasksToMarkdown(jsonNote.tasks);
  if (tasksMarkdown) {
    markdown += tasksMarkdown;
  }

  // Add events
  const eventsMarkdown = convertEventsToMarkdown(jsonNote.events);
  if (eventsMarkdown) {
    markdown += eventsMarkdown;
  }

  // Add notes
  const notesMarkdown = convertNotesToMarkdown(jsonNote.notes);
  if (notesMarkdown) {
    markdown += notesMarkdown;
  }

  // Add original transcript as a reference (commented out)
  if (jsonNote.transcript) {
    markdown += `---\n\n_Original transcript: "${jsonNote.transcript}"_\n`;
  }

  return markdown.trim();
}

function main() {
  const notesDir = join(process.cwd(), "data", "notes");

  console.log("🔍 Scanning for JSON notes in:", notesDir);

  let files: string[];
  try {
    files = readdirSync(notesDir);
  } catch (error) {
    console.error("❌ Error reading notes directory:", error);
    console.log("Make sure the data/notes directory exists");
    process.exit(1);
  }

  const jsonFiles = files.filter((file) => file.endsWith(".json") && !file.endsWith(".meta.json"));

  console.log(`📄 Found ${jsonFiles.length} JSON note(s)\n`);

  if (jsonFiles.length === 0) {
    console.log("✅ No JSON files to migrate");
    return;
  }

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of jsonFiles) {
    const filePath = join(notesDir, file);
    const noteId = file.replace(".json", "");
    const markdownPath = join(notesDir, `${noteId}.md`);
    const metadataPath = join(notesDir, `${noteId}.meta.json`);

    try {
      // Check if already migrated
      try {
        readFileSync(markdownPath, "utf-8");
        console.log(`⏭️  Skipping ${file} (already migrated)`);
        skipped++;
        continue;
      } catch {
        // File doesn't exist, proceed with migration
      }

      // Read JSON note
      const jsonContent = readFileSync(filePath, "utf-8");
      const jsonNote: JsonNote = JSON.parse(jsonContent);

      // Convert to Markdown
      const markdown = convertJsonToMarkdown(jsonNote);

      // Write Markdown file
      writeFileSync(markdownPath, markdown, "utf-8");

      // Create metadata file
      const metadata = {
        id: jsonNote.id,
        timestamp: jsonNote.timestamp,
        transcript: jsonNote.transcript,
        audio_url: jsonNote.audio_url,
        format: "markdown",
        migrated_from: file,
        migrated_at: new Date().toISOString(),
      };
      writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");

      console.log(`✅ Migrated ${file} → ${noteId}.md`);
      migrated++;
    } catch (error: any) {
      console.error(`❌ Error migrating ${file}:`, error.message);
      errors++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Migration Summary:");
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log("=".repeat(60));

  if (migrated > 0) {
    console.log("\n💡 Tip: Original JSON files are preserved.");
    console.log("   You can delete them manually if migration was successful.");
  }
}

// Run the migration
main();
