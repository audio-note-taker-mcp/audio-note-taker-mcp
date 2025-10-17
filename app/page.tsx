"use client";

import { useState } from "react";
import AudioRecorder from "./components/AudioRecorder";
import FileUploader from "./components/FileUploader";
import ResultsDisplay from "./components/ResultsDisplay";
import MarkdownDisplay from "./components/MarkdownDisplay";

type ProcessingStep =
  | "idle"
  | "transcribing"
  | "extracting"
  | "saving"
  | "creating"
  | "complete"
  | "error";

type OutputMode = "json" | "markdown";

interface ProcessedResults {
  transcript: string;
  tasks: any[];
  events: any[];
  notes: any[];
  storageInfo?: {
    note_id: string;
    storage_url: string;
    created_at: string;
  };
}

interface MarkdownResults {
  transcript: string;
  markdown: string;
  storageInfo?: {
    note_id: string;
    storage_url: string;
    created_at: string;
    storage_type?: string;
  };
}

export default function Home() {
  const [outputMode, setOutputMode] = useState<OutputMode>("markdown");
  const [inputMethod, setInputMethod] = useState<"record" | "upload">("record");
  const [audioData, setAudioData] = useState<{
    data: string;
    mimeType: string;
    fileName?: string;
  } | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
  const [results, setResults] = useState<ProcessedResults | null>(null);
  const [markdownResults, setMarkdownResults] = useState<MarkdownResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Session state: accumulated results across multiple recordings (JSON mode)
  const [sessionState, setSessionState] = useState<{
    tasks: any[];
    events: any[];
    notes: any[];
    transcripts: string[];
  }>({
    tasks: [],
    events: [],
    notes: [],
    transcripts: [],
  });

  // Markdown session state (Markdown mode)
  const [markdownDocument, setMarkdownDocument] = useState<string>("");

  const [recordingCount, setRecordingCount] = useState(0);

  const handleFileSelect = (
    data: string,
    mimeType: string,
    fileName: string
  ) => {
    setAudioData({ data, mimeType, fileName });
    setError(null);
  };

  const handleRecordingComplete = async (data: string, mimeType: string) => {
    setAudioData({ data, mimeType, fileName: "recording.webm" });
    setError(null);

    // Auto-submit for processing
    setProcessingStep("transcribing");

    try {
      if (outputMode === "markdown") {
        // Markdown mode processing
        const response = await fetch("/api/process-audio-markdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioData: data,
            mimeType: mimeType,
            fileName: "recording.webm",
            currentMarkdown: markdownDocument,
          }),
        });

        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
          throw new Error(responseData.error || "Processing failed");
        }

        // Simulate step progression for UX
        setProcessingStep("extracting");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProcessingStep("saving");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProcessingStep("complete");
        setMarkdownResults(responseData);
        setMarkdownDocument(responseData.markdown);
        setRecordingCount((prev) => prev + 1);
      } else {
        // JSON mode processing (original)
        const response = await fetch("/api/process-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioData: data,
            mimeType: mimeType,
            fileName: "recording.webm",
            // Pass previous session state for iterative merging
            previousState: {
              tasks: sessionState.tasks,
              events: sessionState.events,
              notes: sessionState.notes,
            },
          }),
        });

        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
          throw new Error(responseData.error || "Processing failed");
        }

        // Simulate step progression for UX
        setProcessingStep("extracting");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProcessingStep("saving");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProcessingStep("creating");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProcessingStep("complete");
        setResults(responseData);

        // Update session state with merged results
        setSessionState({
          tasks: responseData.tasks || [],
          events: responseData.events || [],
          notes: responseData.notes || [],
          transcripts: [...sessionState.transcripts, responseData.transcript],
        });
        setRecordingCount((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "An error occurred while processing the audio");
      setProcessingStep("error");
    }
  };

  const processAudio = async () => {
    if (!audioData) return;

    setProcessingStep("transcribing");
    setError(null);
    setResults(null);
    setMarkdownResults(null);

    try {
      if (outputMode === "markdown") {
        // Markdown mode processing
        const response = await fetch("/api/process-audio-markdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioData: audioData.data,
            mimeType: audioData.mimeType,
            fileName: audioData.fileName,
            currentMarkdown: markdownDocument,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Processing failed");
        }

        // Simulate step progression for UX
        setProcessingStep("extracting");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProcessingStep("saving");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProcessingStep("complete");
        setMarkdownResults(data);
        setMarkdownDocument(data.markdown);
        setRecordingCount((prev) => prev + 1);
      } else {
        // JSON mode processing (original)
        const response = await fetch("/api/process-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioData: audioData.data,
            mimeType: audioData.mimeType,
            fileName: audioData.fileName,
            // Pass previous session state for iterative merging
            previousState: {
              tasks: sessionState.tasks,
              events: sessionState.events,
              notes: sessionState.notes,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Processing failed");
        }

        // Simulate step progression for UX
        setProcessingStep("extracting");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProcessingStep("saving");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProcessingStep("creating");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProcessingStep("complete");
        setResults(data);

        // Update session state with merged results
        setSessionState({
          tasks: data.tasks || [],
          events: data.events || [],
          notes: data.notes || [],
          transcripts: [...sessionState.transcripts, data.transcript],
        });
        setRecordingCount((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "An error occurred while processing the audio");
      setProcessingStep("error");
    }
  };

  const reset = () => {
    setAudioData(null);
    setProcessingStep("idle");
    setResults(null);
    setMarkdownResults(null);
    setError(null);
  };

  const continueRecording = () => {
    setAudioData(null);
    setProcessingStep("idle");
    setError(null);
    // Keep results and session state for next recording
  };

  const resetSession = () => {
    setAudioData(null);
    setProcessingStep("idle");
    setResults(null);
    setMarkdownResults(null);
    setError(null);
    setSessionState({
      tasks: [],
      events: [],
      notes: [],
      transcripts: [],
    });
    setMarkdownDocument("");
    setRecordingCount(0);
  };

  const getStepMessage = () => {
    switch (processingStep) {
      case "transcribing":
        return "Transcribing audio with Deepgram...";
      case "extracting":
        return "Extracting tasks and events with Claude AI...";
      case "saving":
        return "Saving note to storage...";
      case "creating":
        return "Creating calendar events...";
      case "complete":
        return "Processing complete!";
      case "error":
        return "An error occurred";
      default:
        return "";
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-5xl mx-auto ">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Jott.AI
          </h1>
          <p className="text-lg md:text-xl text-purple-200 mb-2">
            AI-powered voice notes that transform into actionable tasks
          </p>
          <p className="text-sm text-purple-300">
            Powered by MCP, Claude AI, and Deepgram
          </p>
        </div>

        {/* Output Mode Toggle */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => {
              setOutputMode("json");
              resetSession();
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition-all border-2 text-sm ${
              outputMode === "json"
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-white/10 text-blue-200 border-blue-400/50 hover:bg-white/20 hover:border-blue-400"
            }`}
          >
            📋 JSON Mode (Tasks/Events/Notes)
          </button>
          <button
            onClick={() => {
              setOutputMode("markdown");
              resetSession();
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition-all border-2 text-sm ${
              outputMode === "markdown"
                ? "bg-green-600 text-white border-green-500"
                : "bg-white/10 text-green-200 border-green-400/50 hover:bg-white/20 hover:border-green-400"
            }`}
          >
            📝 Markdown Mode (Document)
          </button>
        </div>

        {/* Main Content */}
        {processingStep === "idle" || processingStep === "error" ? (
          <div className="space-y-6">
            {/* Active Session Indicator */}
            {recordingCount > 0 && (
              <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4 text-center">
                {outputMode === "json" ? (
                  <p className="text-purple-100 font-semibold">
                    📊 Active Session: {recordingCount} recording{recordingCount !== 1 ? 's' : ''} • {sessionState.tasks.length} tasks • {sessionState.events.length} events • {sessionState.notes.length} notes
                  </p>
                ) : (
                  <p className="text-purple-100 font-semibold">
                    📝 Active Session: {recordingCount} recording{recordingCount !== 1 ? 's' : ''} • {markdownDocument.length} characters
                  </p>
                )}
                <button
                  onClick={resetSession}
                  className="mt-2 text-sm text-purple-300 hover:text-purple-200 underline"
                >
                  Reset Session
                </button>
              </div>
            )}

            {/* Input Method Toggle */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setInputMethod("upload")}
                className={`px-8 py-3 rounded-lg font-semibold transition-all border-2 ${
                  inputMethod === "upload"
                    ? "bg-purple-600 text-white border-purple-500"
                    : "bg-white/10 text-purple-200 border-purple-400/50 hover:bg-white/20 hover:border-purple-400"
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setInputMethod("record")}
                className={`px-8 py-3 rounded-lg font-semibold transition-all border-2 ${
                  inputMethod === "record"
                    ? "bg-purple-600 text-white border-purple-500"
                    : "bg-white/10 text-purple-200 border-purple-400/50 hover:bg-white/20 hover:border-purple-400"
                }`}
              >
                Record Audio
              </button>
            </div>

            {/* Input Component */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-purple-300/30">
              {inputMethod === "upload" ? (
                <FileUploader
                  onFileSelect={handleFileSelect}
                  disabled={processingStep !== "idle"}
                />
              ) : (
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  disabled={processingStep !== "idle"}
                />
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-red-200 mb-2">Error</h3>
                <p className="text-red-100">{error}</p>
                <button
                  onClick={reset}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Process Button */}
            {audioData && processingStep === "idle" && (
              <div className="text-center">
                <button
                  onClick={processAudio}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Process Audio with AI
                </button>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-purple-300/20">
                <div className="text-3xl mb-2">🎤</div>
                <h3 className="font-semibold text-white mb-1">1. Capture</h3>
                <p className="text-sm text-purple-200">
                  Record or upload your audio note
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-purple-300/20">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-semibold text-white mb-1">2. Process</h3>
                <p className="text-sm text-purple-200">
                  AI extracts tasks, events, and notes
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-purple-300/20">
                <div className="text-3xl mb-2">✅</div>
                <h3 className="font-semibold text-white mb-1">3. Organize</h3>
                <p className="text-sm text-purple-200">
                  Get structured, actionable results
                </p>
              </div>
            </div>

            {/* MCP Tools Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-purple-300/30">
              <h2 className="text-2xl font-bold text-white mb-4">
                MCP Tools Chain
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
                  <h3 className="font-semibold text-white mb-2">
                    1. transcribe_audio
                  </h3>
                  <p className="text-sm text-purple-200">
                    Deepgram speech-to-text transcription
                  </p>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
                  <h3 className="font-semibold text-white mb-2">
                    2. extract_tasks
                  </h3>
                  <p className="text-sm text-purple-200">
                    Claude AI extracts structured data
                  </p>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
                  <h3 className="font-semibold text-white mb-2">
                    3. save_note
                  </h3>
                  <p className="text-sm text-purple-200">
                    Persists to S3 or local storage
                  </p>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
                  <h3 className="font-semibold text-white mb-2">
                    4. create_calendar_event
                  </h3>
                  <p className="text-sm text-purple-200">
                    Generates Google Calendar links
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : processingStep === "complete" && (results || markdownResults) ? (
          <div className="space-y-6">
            {/* Session Info & Success Message */}
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 text-center">
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Processing Complete!
              </h2>
              <p className="text-green-100 mb-3">
                Your audio note has been processed and saved
              </p>
              {recordingCount > 0 && (
                <div className="inline-block px-4 py-2 bg-purple-500/30 rounded-lg border border-purple-400/50">
                  {outputMode === "json" && results ? (
                    <p className="text-sm text-purple-100">
                      Session Recording #{recordingCount} • {sessionState.tasks.length} tasks • {sessionState.events.length} events • {sessionState.notes.length} notes
                    </p>
                  ) : (
                    <p className="text-sm text-purple-100">
                      Session Recording #{recordingCount} • {markdownDocument.length} characters
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Results */}
            {outputMode === "json" && results ? (
              <ResultsDisplay
                transcript={results.transcript}
                tasks={results.tasks}
                events={results.events}
                notes={results.notes}
                storageInfo={results.storageInfo}
              />
            ) : markdownResults ? (
              <MarkdownDisplay
                markdown={markdownResults.markdown}
                transcript={markdownResults.transcript}
                storageInfo={markdownResults.storageInfo}
              />
            ) : null}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={continueRecording}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                ➕ Add Another Recording
              </button>
              <button
                onClick={resetSession}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border-2 border-purple-400/50 hover:border-purple-400 text-white font-semibold text-lg rounded-xl transition-all"
              >
                🔄 Start New Session
              </button>
            </div>
          </div>
        ) : (
          // Processing State
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-purple-300/30 text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-400 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {getStepMessage()}
            </h2>
            <p className="text-purple-200">
              Please wait while we process your audio...
            </p>

            {/* Progress Steps */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="space-y-3">
                {[
                  { step: "transcribing", label: "Transcribing audio" },
                  { step: "extracting", label: "Extracting tasks & events" },
                  { step: "saving", label: "Saving note" },
                  { step: "creating", label: "Creating calendar events" },
                ].map(({ step, label }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        processingStep === step
                          ? "bg-purple-500 animate-pulse"
                          : [
                              "transcribing",
                              "extracting",
                              "saving",
                              "creating",
                            ].indexOf(processingStep) >
                            [
                              "transcribing",
                              "extracting",
                              "saving",
                              "creating",
                            ].indexOf(step)
                          ? "bg-green-500"
                          : "bg-white/20"
                      }`}
                    >
                      {[
                        "transcribing",
                        "extracting",
                        "saving",
                        "creating",
                      ].indexOf(processingStep) >
                      [
                        "transcribing",
                        "extracting",
                        "saving",
                        "creating",
                      ].indexOf(step) ? (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : null}
                    </div>
                    <span
                      className={`text-sm ${
                        processingStep === step
                          ? "text-white font-semibold"
                          : "text-purple-300"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-purple-300">
          <p>
            Built with{" "}
            <a
              href="https://modelcontextprotocol.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-purple-200"
            >
              MCP
            </a>
            ,{" "}
            <a
              href="https://anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-purple-200"
            >
              Claude AI
            </a>
            , and{" "}
            <a
              href="https://deepgram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-purple-200"
            >
              Deepgram
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
