"use client";

import { useState, useCallback } from "react";

interface FileUploaderProps {
  onFileSelect: (audioData: string, mimeType: string, fileName: string) => void;
  disabled?: boolean;
}

export default function FileUploader({
  onFileSelect,
  disabled,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      // Validate file type
      const validTypes = [
        "audio/wav",
        "audio/mp3",
        "audio/mpeg",
        "audio/webm",
        "audio/mp4",
        "audio/m4a",
      ];
      if (
        !validTypes.includes(file.type) &&
        !file.name.match(/\.(wav|mp3|webm|m4a)$/i)
      ) {
        alert("Please upload a valid audio file (WAV, MP3, WEBM, M4A)");
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert("File size must be less than 10MB");
        return;
      }

      setFileName(file.name);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        // Remove data URL prefix to get just the base64 data
        const base64Data = base64.split(",")[1];
        onFileSelect(base64Data, file.type, file.name);
      };
      reader.readAsDataURL(file);
    },
    [onFileSelect]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <form
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className="relative"
      >
        <input
          type="file"
          id="file-upload"
          accept="audio/*,.mp3,.wav,.webm,.m4a"
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className={`
            flex flex-col items-center justify-center
            w-full h-48 border-2 border-dashed rounded-xl
            cursor-pointer transition-all
            ${
              dragActive
                ? "border-teal-400 bg-teal-500/20"
                : "border-teal-300/50 bg-white/5 hover:bg-white/10"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-12 h-12 mb-4 text-teal-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            {fileName ? (
              <>
                <p className="mb-2 text-sm text-teal-200">
                  <span className="font-semibold">Selected:</span> {fileName}
                </p>
                <p className="text-xs text-teal-300">Click to change file</p>
              </>
            ) : (
              <>
                <p className="mb-2 text-sm text-teal-200">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-teal-300">
                  Audio files (WAV, MP3, WEBM, M4A)
                </p>
                <p className="text-xs text-teal-300">Max 10MB</p>
              </>
            )}
          </div>
        </label>
      </form>
    </div>
  );
}
