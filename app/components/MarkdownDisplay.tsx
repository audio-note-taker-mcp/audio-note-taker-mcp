import React from "react";

interface MarkdownDisplayProps {
  markdown: string;
  transcript?: string;
  storageInfo?: {
    note_id: string;
    storage_url: string;
    created_at: string;
    storage_type?: string;
  };
}

export default function MarkdownDisplay({
  markdown,
  transcript,
  storageInfo,
}: MarkdownDisplayProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    alert("Markdown copied to clipboard!");
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `note_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Copy Markdown
        </button>
        <button
          onClick={downloadMarkdown}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Download .md
        </button>
      </div>

      {/* Transcript Section */}
      {transcript && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Latest Transcript:</h3>
          <p className="text-gray-600 italic">&quot;{transcript}&quot;</p>
        </div>
      )}

      {/* Markdown Content - Rendered */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Your Notes:</h3>
          <span className="text-sm text-gray-500">Rendered View</span>
        </div>
        <div className="prose prose-sm max-w-none markdown-content">
          <MarkdownRenderer content={markdown} />
        </div>
      </div>

      {/* Markdown Content - Raw */}
      <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Markdown Source:</h3>
          <span className="text-sm text-gray-400">Raw View</span>
        </div>
        <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
          <code>{markdown}</code>
        </pre>
      </div>

      {/* Storage Info */}
      {storageInfo && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Storage Info:</h3>
          <div className="text-sm text-blue-600 space-y-1">
            <p>
              <strong>Note ID:</strong> {storageInfo.note_id}
            </p>
            <p>
              <strong>Storage:</strong> {storageInfo.storage_url}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(storageInfo.created_at).toLocaleString()}
            </p>
            {storageInfo.storage_type && (
              <p>
                <strong>Type:</strong>{" "}
                {storageInfo.storage_type === "s3" ? "☁️ S3" : "💾 Local"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Markdown Renderer Component
function MarkdownRenderer({ content }: { content: string }) {
  // Parse markdown manually for now (we'll enhance this with react-markdown later)
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc ml-6 space-y-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    // Headings
    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={index} className="text-2xl font-bold mt-6 mb-3">
          {line.substring(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={index} className="text-xl font-bold mt-5 mb-2">
          {line.substring(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={index} className="text-lg font-semibold mt-4 mb-2">
          {line.substring(4)}
        </h3>
      );
    }
    // Checkboxes (tasks)
    else if (line.match(/^- \[([ x])\]/)) {
      if (!inList) inList = true;
      const checked = line.includes("[x]");
      const text = line.substring(6);
      listItems.push(
        <li key={index} className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mt-1"
          />
          <span className={checked ? "line-through text-gray-500" : ""}>
            {formatInlineMarkdown(text)}
          </span>
        </li>
      );
    }
    // Regular list items
    else if (line.match(/^- /)) {
      if (!inList) inList = true;
      const text = line.substring(2);
      listItems.push(
        <li key={index}>{formatInlineMarkdown(text)}</li>
      );
    }
    // Regular paragraph
    else if (line.trim().length > 0) {
      flushList();
      elements.push(
        <p key={index} className="mb-2">
          {formatInlineMarkdown(line)}
        </p>
      );
    }
    // Empty line
    else {
      flushList();
      elements.push(<div key={index} className="h-2" />);
    }
  });

  flushList();

  return <div>{elements}</div>;
}

// Format inline markdown (bold, italic, etc.)
function formatInlineMarkdown(text: string): React.ReactNode {
  // Bold: **text** or __text__
  let parts: (string | React.ReactNode)[] = [text];

  // Bold
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return part;
    const regex = /\*\*(.+?)\*\*|__(.+?)__/g;
    const segments: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(part)) !== null) {
      if (match.index > lastIndex) {
        segments.push(part.substring(lastIndex, match.index));
      }
      segments.push(
        <strong key={match.index}>{match[1] || match[2]}</strong>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < part.length) {
      segments.push(part.substring(lastIndex));
    }

    return segments.length > 0 ? segments : part;
  });

  // Italic: *text* or _text_
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return part;
    const regex = /\*(.+?)\*|_(.+?)_/g;
    const segments: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(part)) !== null) {
      if (match.index > lastIndex) {
        segments.push(part.substring(lastIndex, match.index));
      }
      segments.push(<em key={match.index}>{match[1] || match[2]}</em>);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < part.length) {
      segments.push(part.substring(lastIndex));
    }

    return segments.length > 0 ? segments : part;
  });

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
