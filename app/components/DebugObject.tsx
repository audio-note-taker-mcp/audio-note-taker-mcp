"use client";

import { useState } from "react";

interface DebugObjectProps {
  data: any;
  title?: string;
}

export default function DebugObject({
  data,
  title = "Debug Data",
}: DebugObjectProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const copyToClipboard = () => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString);
    alert("Copied to clipboard!");
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-600/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-700/30 border-b border-slate-600/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐛</span>
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 text-xs bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
            title="Copy to clipboard"
          >
            Copy JSON
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-xs bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 overflow-x-auto">
          <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap break-words">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
