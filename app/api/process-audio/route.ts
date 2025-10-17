import { NextRequest, NextResponse } from "next/server";
import {
  transcribeAudio,
  extractTasks,
  saveNote,
  createCalendarEvent,
} from "@/app/lib/mcp-tools";

export const maxDuration = 300; // 5 minutes timeout

interface ProcessAudioRequest {
  audioData: string;
  mimeType: string;
  fileName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessAudioRequest = await request.json();
    const { audioData, mimeType } = body;

    if (!audioData) {
      return NextResponse.json({ error: "No audio data provided" }, { status: 400 });
    }

    console.log("Processing audio with MCP tools...");

    // Step 1: Transcribe Audio
    console.log("Step 1: Transcribing audio...");
    const transcriptionData = await transcribeAudio(audioData, mimeType);
    const transcript = transcriptionData.transcript;
    console.log("Transcript:", transcript);

    // Step 2: Extract Tasks
    console.log("Step 2: Extracting tasks...");
    const extractedData = await extractTasks(transcript);
    const { tasks = [], events = [], notes = [] } = extractedData;
    console.log("Extracted:", { tasks, events, notes });

    // Step 3: Save Note
    console.log("Step 3: Saving note...");
    const storageInfo = await saveNote(transcript, tasks, events, notes);

    // Step 4: Create Calendar Events
    console.log("Step 4: Creating calendar events...");
    const calendarLinks: string[] = [];

    for (const event of events) {
      const calendarData = await createCalendarEvent(
        event.title,
        event.date,
        event.time,
        event.description
      );
      if (calendarData.calendar_link) {
        calendarLinks.push(calendarData.calendar_link);
        // Add the calendar link to the event object
        event.calendar_link = calendarData.calendar_link;
      }
    }

    console.log("Processing complete!");

    // Return consolidated results
    return NextResponse.json({
      success: true,
      transcript,
      tasks,
      events,
      notes,
      storageInfo: {
        note_id: storageInfo.note_id,
        storage_url: storageInfo.storage_url,
        created_at: storageInfo.created_at,
      },
      calendarLinks,
    });
  } catch (error: any) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while processing the audio",
      },
      { status: 500 }
    );
  }
}
