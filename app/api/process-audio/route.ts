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
  previousState?: {
    tasks?: any[];
    events?: any[];
    notes?: any[];
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  console.log("\n" + "=".repeat(80));
  console.log(`🎙️  NEW AUDIO PROCESSING REQUEST [${requestId}]`);
  console.log("=".repeat(80));

  try {
    const body: ProcessAudioRequest = await request.json();
    const { audioData, mimeType, previousState } = body;

    if (!audioData) {
      console.log(`❌ [${requestId}] No audio data provided`);
      return NextResponse.json({ error: "No audio data provided" }, { status: 400 });
    }

    console.log(`📊 [${requestId}] Request Info:`);
    console.log(`   - MIME Type: ${mimeType}`);
    console.log(`   - Audio Size: ${(audioData.length / 1024).toFixed(2)} KB`);
    console.log(`   - Has Previous State: ${!!previousState}`);
    if (previousState) {
      console.log(`   - Previous Tasks: ${previousState.tasks?.length || 0}`);
      console.log(`   - Previous Events: ${previousState.events?.length || 0}`);
      console.log(`   - Previous Notes: ${previousState.notes?.length || 0}`);
    }

    // Step 1: Transcribe Audio
    console.log(`\n🎧 [${requestId}] STEP 1: Transcribing audio...`);
    const step1Start = Date.now();
    const transcriptionData = await transcribeAudio(audioData, mimeType);
    const transcript = transcriptionData.transcript;
    const step1Duration = Date.now() - step1Start;
    console.log(`✅ [${requestId}] Transcription complete (${step1Duration}ms)`);
    console.log(`   - Transcript: "${transcript.substring(0, 100)}${transcript.length > 100 ? '...' : ''}"`);
    console.log(`   - Confidence: ${transcriptionData.confidence}`);

    // Step 2: Extract Tasks (with previous state for iterative merging)
    console.log(`\n🤖 [${requestId}] STEP 2: Extracting tasks with AI...`);
    const step2Start = Date.now();
    const extractedData = await extractTasks(transcript, previousState);
    const { tasks = [], events = [], notes = [] } = extractedData;
    const step2Duration = Date.now() - step2Start;
    console.log(`✅ [${requestId}] Task extraction complete (${step2Duration}ms)`);
    console.log(`   - Tasks: ${tasks.length}`);
    console.log(`   - Events: ${events.length}`);
    console.log(`   - Notes: ${notes.length}`);

    // Step 3: Save Note
    console.log(`\n💾 [${requestId}] STEP 3: Saving note to storage...`);
    const step3Start = Date.now();
    const storageInfo = await saveNote(transcript, tasks, events, notes);
    const step3Duration = Date.now() - step3Start;

    // Determine storage type and log accordingly
    const isS3 = storageInfo.storage_url?.startsWith("s3://");
    if (isS3) {
      console.log(`✅ [${requestId}] 🌩️  SAVED TO S3! (${step3Duration}ms)`);
      console.log(`   📍 Location: ${storageInfo.storage_url}`);
      console.log(`   🆔 Note ID: ${storageInfo.note_id}`);
    } else {
      console.log(`✅ [${requestId}] Saved to local storage (${step3Duration}ms)`);
      console.log(`   📁 Location: ${storageInfo.storage_url}`);
    }

    // Step 4: Create Calendar Events
    console.log(`\n📅 [${requestId}] STEP 4: Creating calendar events...`);
    const step4Start = Date.now();
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
        event.calendar_link = calendarData.calendar_link;
      }
    }
    const step4Duration = Date.now() - step4Start;
    console.log(`✅ [${requestId}] Calendar events created (${step4Duration}ms)`);
    console.log(`   - Events with links: ${calendarLinks.length}`);

    const totalDuration = Date.now() - startTime;
    console.log("\n" + "=".repeat(80));
    console.log(`🎉 [${requestId}] PROCESSING COMPLETE!`);
    console.log(`   ⏱️  Total Time: ${totalDuration}ms`);
    console.log(`   📊 Breakdown:`);
    console.log(`      - Transcription: ${step1Duration}ms`);
    console.log(`      - AI Extraction: ${step2Duration}ms`);
    console.log(`      - Storage: ${step3Duration}ms`);
    console.log(`      - Calendar: ${step4Duration}ms`);
    if (isS3) {
      console.log(`   🌩️  S3 Upload: SUCCESS ✓`);
    }
    console.log("=".repeat(80) + "\n");

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
        storage_type: storageInfo.storage_type || (isS3 ? "s3" : "local"),
      },
      calendarLinks,
      _debug: {
        requestId,
        totalDuration,
        stepDurations: {
          transcription: step1Duration,
          extraction: step2Duration,
          storage: step3Duration,
          calendar: step4Duration,
        },
      },
    });
  } catch (error: any) {
    const errorDuration = Date.now() - startTime;
    console.log("\n" + "=".repeat(80));
    console.error(`❌ [${requestId}] ERROR PROCESSING AUDIO (${errorDuration}ms)`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while processing the audio",
        _debug: {
          requestId,
          duration: errorDuration,
        },
      },
      { status: 500 }
    );
  }
}
