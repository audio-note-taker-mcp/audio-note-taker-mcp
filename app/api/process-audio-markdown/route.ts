import { NextRequest, NextResponse } from "next/server";
import {
  transcribeAudio,
  updateMarkdownDocument,
  saveMarkdownNote,
} from "@/app/lib/mcp-tools";

export const maxDuration = 300; // 5 minutes timeout

interface ProcessAudioMarkdownRequest {
  audioData: string;
  mimeType: string;
  fileName?: string;
  currentMarkdown?: string; // The current markdown document to update
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  console.log("\n" + "=".repeat(80));
  console.log(`📝 NEW MARKDOWN AUDIO PROCESSING REQUEST [${requestId}]`);
  console.log("=".repeat(80));

  try {
    const body: ProcessAudioMarkdownRequest = await request.json();
    const { audioData, mimeType, currentMarkdown } = body;

    if (!audioData) {
      console.log(`❌ [${requestId}] No audio data provided`);
      return NextResponse.json({ error: "No audio data provided" }, { status: 400 });
    }

    console.log(`📊 [${requestId}] Request Info:`);
    console.log(`   - MIME Type: ${mimeType}`);
    console.log(`   - Audio Size: ${(audioData.length / 1024).toFixed(2)} KB`);
    console.log(`   - Has Existing Markdown: ${!!currentMarkdown}`);
    if (currentMarkdown) {
      console.log(`   - Current Document Length: ${currentMarkdown.length} characters`);
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

    // Step 2: Update Markdown Document
    console.log(`\n🤖 [${requestId}] STEP 2: Updating markdown document with AI...`);
    const step2Start = Date.now();
    const markdownResult = await updateMarkdownDocument(transcript, currentMarkdown);
    const updatedMarkdown = markdownResult.markdown;
    const step2Duration = Date.now() - step2Start;
    console.log(`✅ [${requestId}] Markdown update complete (${step2Duration}ms)`);
    console.log(`   - Updated Document Length: ${updatedMarkdown.length} characters`);
    if ("fallback" in markdownResult && markdownResult.fallback) {
      console.log(`   ⚠️  Used fallback mode (simple append)`);
    }

    // Step 3: Save Markdown Note
    console.log(`\n💾 [${requestId}] STEP 3: Saving markdown note to storage...`);
    const step3Start = Date.now();
    const storageInfo = await saveMarkdownNote(updatedMarkdown, transcript);
    const step3Duration = Date.now() - step3Start;

    // Determine storage type and log accordingly
    const isS3 = storageInfo.storage_url?.startsWith("s3://");
    if (isS3) {
      console.log(`✅ [${requestId}] 🌩️  SAVED TO S3! (${step3Duration}ms)`);
      console.log(`   📍 Location: ${storageInfo.storage_url}`);
    } else {
      console.log(`✅ [${requestId}] 💾 Saved to local filesystem (${step3Duration}ms)`);
      console.log(`   📍 Location: ${storageInfo.storage_url}`);
    }

    const totalDuration = Date.now() - startTime;

    console.log(`\n${"=".repeat(80)}`);
    console.log(`✅ [${requestId}] REQUEST COMPLETE - Total time: ${totalDuration}ms`);
    console.log(`${"=".repeat(80)}\n`);

    // Return response with markdown and storage info
    return NextResponse.json({
      success: true,
      transcript,
      markdown: updatedMarkdown,
      storageInfo: {
        note_id: storageInfo.note_id,
        storage_url: storageInfo.storage_url,
        created_at: storageInfo.created_at,
        storage_type: storageInfo.storage_type,
        format: "markdown",
      },
      _debug: {
        requestId,
        totalDuration,
        stepDurations: {
          transcription: step1Duration,
          markdownUpdate: step2Duration,
          storage: step3Duration,
        },
        transcriptionConfidence: transcriptionData.confidence,
        audioDuration: transcriptionData.duration,
        usedFallback: ("fallback" in markdownResult && markdownResult.fallback) || false,
      },
    });
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error(`\n❌ [${requestId}] REQUEST FAILED after ${totalDuration}ms`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        requestId,
        duration: totalDuration,
      },
      { status: 500 }
    );
  }
}
