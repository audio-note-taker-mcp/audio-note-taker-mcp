"use client";

import { useState, useRef, useCallback } from "react";

interface AudioRecorderProps {
  onRecordingComplete: (audioData: string, mimeType: string) => void;
  disabled?: boolean;
}

export default function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(",")[1];
          onRecordingComplete(base64Data, mediaRecorder.mimeType);
        };
        reader.readAsDataURL(blob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-xl border border-purple-300/50">
        {!isRecording && !audioURL && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className={`
              flex flex-col items-center justify-center gap-4
              px-8 py-6 rounded-xl transition-all
              ${
                disabled
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-purple-600 hover:bg-purple-700 active:scale-95"
              }
            `}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
            <span className="text-white font-semibold">Start Recording</span>
          </button>
        )}

        {isRecording && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-2xl font-mono text-white mb-2">{formatTime(recordingTime)}</p>
              <p className="text-sm text-purple-200">Recording...</p>
            </div>
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition-colors"
            >
              Stop Recording
            </button>
          </div>
        )}

        {audioURL && !isRecording && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold">Recording Complete!</p>
            <audio src={audioURL} controls className="w-full max-w-md" />
            <button
              onClick={() => {
                setAudioURL(null);
                setRecordingTime(0);
              }}
              className="text-sm text-purple-300 hover:text-purple-200 underline"
            >
              Record Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
