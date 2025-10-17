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

// Tool 1: Transcribe Audio
export async function transcribeAudio(audioData: string, mimeType?: string) {
  if (!deepgram) {
    throw new Error("Deepgram API key not configured");
  }

  try {
    const isUrl = audioData.startsWith("http");
    let transcription;

    if (isUrl) {
      const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
        { url: audioData },
        { model: "nova-2", smart_format: true }
      );
      if (error) throw error;
      transcription = result;
    } else {
      const audioBuffer = Buffer.from(audioData, "base64");
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        { model: "nova-2", smart_format: true, mimetype: mimeType }
      );
      if (error) throw error;
      transcription = result;
    }

    const transcript =
      transcription.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
    const confidence =
      transcription.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;
    const duration = transcription.metadata?.duration || 0;

    return {
      transcript,
      duration,
      confidence,
      success: true,
    };
  } catch (error: any) {
    throw new Error(`Transcription error: ${error.message}`);
  }
}

// Tool 2: Extract Tasks
export async function extractTasks(transcript: string, context?: string) {
  // Fallback mode if Anthropic is not configured or has credit issues
  if (!anthropic) {
    console.warn("Anthropic API key not configured, using fallback extraction");
    return useFallbackExtraction(transcript);
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

    const extracted = JSON.parse(responseText);

    return {
      ...extracted,
      success: true,
    };
  } catch (error: any) {
    // If Anthropic API fails due to credits, use fallback
    if (error.message.includes("credit balance") || error.message.includes("invalid_request_error")) {
      console.warn("Anthropic API credit issue, using fallback extraction:", error.message);
      return useFallbackExtraction(transcript);
    }
    throw new Error(`Task extraction error: ${error.message}`);
  }
}

// Simple fallback extraction using pattern matching
function useFallbackExtraction(transcript: string) {
  const tasks: any[] = [];
  const events: any[] = [];
  const notes: any[] = [];

  // Basic pattern matching for common phrases
  const lines = transcript.split(/[.!?]+/).filter(line => line.trim().length > 0);

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();

    // Detect tasks (remind, todo, need to, have to, etc.)
    if (lowerLine.match(/remind|todo|need to|have to|don't forget|make sure/)) {
      tasks.push({
        title: line.trim(),
        description: "",
        due_date: null,
        priority: "medium"
      });
    }
    // Detect events (schedule, meeting, appointment, etc.)
    else if (lowerLine.match(/schedule|meeting|appointment|call|sync/)) {
      events.push({
        title: line.trim(),
        date: new Date().toISOString().split("T")[0],
        time: null,
        description: ""
      });
    }
    // Everything else as a note
    else if (line.trim().length > 10) {
      notes.push({
        content: line.trim(),
        category: "general"
      });
    }
  }

  // If nothing extracted, create a generic note
  if (tasks.length === 0 && events.length === 0 && notes.length === 0) {
    notes.push({
      content: transcript,
      category: "general"
    });
  }

  return {
    tasks,
    events,
    notes,
    success: true,
    fallback: true, // Indicate this was fallback mode
  };
}

// Tool 3: Save Note
export async function saveNote(
  transcript: string,
  tasks: any[],
  events: any[],
  notes: any[],
  audioUrl?: string
) {
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
      audio_url: audioUrl,
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
        note_id: noteId,
        storage_url: `s3://${process.env.AWS_S3_BUCKET}/${key}`,
        created_at: timestamp,
        success: true,
      };
    } else {
      // Fallback to local filesystem
      const notesDir = join(process.cwd(), "data", "notes");
      await mkdir(notesDir, { recursive: true });
      const filePath = join(notesDir, `${noteId}.json`);
      await writeFile(filePath, noteJson);

      return {
        note_id: noteId,
        storage_url: `file://${filePath}`,
        created_at: timestamp,
        success: true,
      };
    }
  } catch (error: any) {
    throw new Error(`Save note error: ${error.message}`);
  }
}

// Tool 4: Create Calendar Event
export async function createCalendarEvent(
  title: string,
  date: string,
  time?: string,
  description?: string
) {
  try {
    const eventId = `event_${Date.now()}`;
    const dateTime = time ? `${date}T${time}:00` : date;

    const calendarLink = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
      title
    )}&dates=${dateTime.replace(/[-:]/g, "")}/${dateTime.replace(/[-:]/g, "")}${
      description ? `&details=${encodeURIComponent(description)}` : ""
    }`;

    return {
      event_id: eventId,
      calendar_link: calendarLink,
      title,
      date,
      time,
      success: true,
    };
  } catch (error: any) {
    throw new Error(`Calendar event error: ${error.message}`);
  }
}
