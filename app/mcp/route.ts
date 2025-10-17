import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { createClient } from "@deepgram/sdk";
import Anthropic from "@anthropic-ai/sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Initialize clients
const deepgram = process.env.DEEPGRAM_API_KEY
  ? createClient(process.env.DEEPGRAM_API_KEY)
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const s3Client =
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      })
    : null;

// StreamableHttp server
const handler = createMcpHandler(
  async (server) => {
    // Tool 1: Transcribe Audio
    server.tool(
      "transcribe_audio",
      "Transcribes audio file using Deepgram API. Accepts base64 encoded audio data or URL.",
      {
        audio_data: z.string().describe("Base64 encoded audio data or URL"),
        mime_type: z
          .string()
          .optional()
          .describe("MIME type of audio (e.g., audio/webm, audio/wav)"),
      },
      async ({ audio_data, mime_type }) => {
        if (!deepgram) {
          return {
            content: [
              {
                type: "text",
                text: "Error: Deepgram API key not configured. Please set DEEPGRAM_API_KEY environment variable.",
              },
            ],
          };
        }

        try {
          // Check if it's a URL or base64 data
          const isUrl = audio_data.startsWith("http");

          let transcription;
          if (isUrl) {
            // Transcribe from URL
            const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
              { url: audio_data },
              { model: "nova-2", smart_format: true }
            );
            if (error) throw error;
            transcription = result;
          } else {
            // Assume base64 encoded audio
            const audioBuffer = Buffer.from(audio_data, "base64");

            const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
              audioBuffer,
              { model: "nova-2", smart_format: true, mimetype: mime_type }
            );
            if (error) throw error;
            transcription = result;
          }

          const transcript =
            transcription.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
          const confidence =
            transcription.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;
          const duration =
            transcription.metadata?.duration || 0;

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    transcript,
                    duration,
                    confidence,
                    success: true,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `Error transcribing audio: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    // Tool 2: Extract Tasks
    server.tool(
      "extract_tasks",
      "Analyzes transcript text and extracts actionable items (tasks, events, notes) using Claude AI.",
      {
        transcript: z.string().describe("The transcribed text to analyze"),
        context: z.string().optional().describe("Optional context about the user or situation"),
      },
      async ({ transcript, context }) => {
        if (!anthropic) {
          return {
            content: [
              {
                type: "text",
                text: "Error: Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.",
              },
            ],
          };
        }

        try {
          const systemPrompt = `You are an AI assistant that extracts actionable items from voice note transcripts.

Analyze the transcript and extract:
1. **Tasks**: Action items with optional due dates and priority
2. **Events**: Calendar events with dates and times
3. **Notes**: General information or ideas

Return ONLY valid JSON in this exact format:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "due_date": "YYYY-MM-DD or null",
      "priority": "low|medium|high"
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

Today's date is ${new Date().toISOString().split("T")[0]}.
${context ? `\nContext: ${context}` : ""}`;

          const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: [
              {
                role: "user",
                content: `Transcript: ${transcript}`,
              },
            ],
            system: systemPrompt,
          });

          const responseText =
            message.content[0].type === "text" ? message.content[0].text : "";

          // Parse the JSON response
          const extracted = JSON.parse(responseText);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    ...extracted,
                    success: true,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `Error extracting tasks: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    // Tool 3: Save Note
    server.tool(
      "save_note",
      "Saves a processed note with all extracted data to storage (S3 or local filesystem).",
      {
        transcript: z.string().describe("Original transcript"),
        tasks: z.array(z.any()).describe("Extracted tasks"),
        events: z.array(z.any()).describe("Extracted events"),
        notes: z.array(z.any()).describe("Extracted notes"),
        audio_url: z.string().optional().describe("URL of original audio file"),
      },
      async ({ transcript, tasks, events, notes, audio_url }) => {
        try {
          const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const timestamp = new Date().toISOString();

          const noteData = {
            id: noteId,
            timestamp,
            transcript,
            tasks,
            events,
            notes,
            audio_url,
          };

          const noteJson = JSON.stringify(noteData, null, 2);

          // Try S3 first, fallback to local filesystem
          if (s3Client && process.env.AWS_S3_BUCKET) {
            const key = `notes/${noteId}.json`;
            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: key,
                Body: noteJson,
                ContentType: "application/json",
              })
            );

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      note_id: noteId,
                      storage_url: `s3://${process.env.AWS_S3_BUCKET}/${key}`,
                      created_at: timestamp,
                      success: true,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          } else {
            // Fallback to local filesystem
            const notesDir = join(process.cwd(), "data", "notes");
            await mkdir(notesDir, { recursive: true });
            const filePath = join(notesDir, `${noteId}.json`);
            await writeFile(filePath, noteJson);

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      note_id: noteId,
                      storage_url: `file://${filePath}`,
                      created_at: timestamp,
                      success: true,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `Error saving note: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    // Tool 4: Create Calendar Event (Mock for demo)
    server.tool(
      "create_calendar_event",
      "Creates a calendar event (mock implementation for demo purposes).",
      {
        title: z.string().describe("Event title"),
        date: z.string().describe("Event date (YYYY-MM-DD)"),
        time: z.string().optional().describe("Event time (HH:MM)"),
        description: z.string().optional().describe("Event description"),
      },
      async ({ title, date, time, description }) => {
        try {
          const eventId = `event_${Date.now()}`;
          const dateTime = time ? `${date}T${time}:00` : date;

          // Mock implementation - in real app, would call Google Calendar API
          const calendarLink = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
            title
          )}&dates=${dateTime.replace(/[-:]/g, "")}/${dateTime.replace(/[-:]/g, "")}${
            description ? `&details=${encodeURIComponent(description)}` : ""
          }`;

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    event_id: eventId,
                    calendar_link: calendarLink,
                    title,
                    date,
                    time,
                    success: true,
                    note: "Mock event created. Click calendar_link to add to your Google Calendar.",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `Error creating calendar event: ${error.message}`,
              },
            ],
          };
        }
      }
    );
  },
  {
    capabilities: {
      tools: {
        transcribe_audio: {
          description:
            "Transcribes audio file using Deepgram API. Accepts base64 encoded audio data or URL.",
        },
        extract_tasks: {
          description:
            "Analyzes transcript text and extracts actionable items (tasks, events, notes) using Claude AI.",
        },
        save_note: {
          description:
            "Saves a processed note with all extracted data to storage (S3 or local filesystem).",
        },
        create_calendar_event: {
          description:
            "Creates a calendar event (mock implementation for demo purposes).",
        },
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 300,
    disableSse: true,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
