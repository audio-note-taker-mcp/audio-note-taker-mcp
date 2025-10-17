"use client";
import MicrophoneDropdown from "./MicrophoneDropdown";

export default function Navigation() {
  // Placeholder handler for microphone selection
  const handleMicSelect = (deviceId: string) => {
    // You can implement logic to use the selected microphone
    // For now, just log it
    console.log("Selected microphone:", deviceId);
  };

  return (
    <nav className="flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 border-b border-teal-400/30 shadow-md">
      {/* Navigation options will go here */}
      <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">
        Jott.AI
      </h1>
      <div className="ml-auto">
        <MicrophoneDropdown onSelect={handleMicSelect} />
      </div>
    </nav>
  );
}
