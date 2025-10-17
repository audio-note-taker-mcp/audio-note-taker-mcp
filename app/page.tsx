"use client";

import { useState } from "react";
import AudioRecorder from "./components/AudioRecorder";
import FileUploader from "./components/FileUploader";
import ResultsDisplay from "./components/ResultsDisplay";

type ProcessingStep =
  | "idle"
  | "transcribing"
  | "extracting"
  | "saving"
  | "creating"
  | "complete"
  | "error";

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

export default function Home() {
  const [inputMethod, setInputMethod] = useState<"record" | "upload">("record");
  const [audioData, setAudioData] = useState<{
    data: string;
    mimeType: string;
    fileName?: string;
  } | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
  const [results, setResults] = useState<ProcessedResults | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const response = await fetch("/api/process-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioData: data,
          mimeType: mimeType,
          fileName: "recording.webm",
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

    try {
      const response = await fetch("/api/process-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioData: audioData.data,
          mimeType: audioData.mimeType,
          fileName: audioData.fileName,
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
    setError(null);
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

        {/* Main Content */}
        {processingStep === "idle" || processingStep === "error" ? (
          <div className="space-y-6">
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
        ) : processingStep === "complete" && results ? (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 text-center">
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Processing Complete!
              </h2>
              <p className="text-green-100">
                Your audio note has been processed and saved
              </p>
            </div>

            {/* Results */}
            <ResultsDisplay
              transcript={results.transcript}
              tasks={results.tasks}
              events={results.events}
              notes={results.notes}
              storageInfo={results.storageInfo}
            />

            {/* Action Buttons */}
            <div className="text-center">
              <button
                onClick={reset}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Process Another Note
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
