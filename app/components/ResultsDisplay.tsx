"use client";

import DebugObject from "./DebugObject";

interface Subtask {
  title: string;
  completed?: boolean;
}

interface Task {
  title: string;
  description?: string;
  due_date?: string;
  priority: "low" | "medium" | "high";
  subtasks?: Subtask[];
}

interface Event {
  title: string;
  date: string;
  time?: string;
  description?: string;
  calendar_link?: string;
}

interface Note {
  content: string;
  category?: string;
}

interface ResultsDisplayProps {
  transcript: string;
  tasks: Task[];
  events: Event[];
  notes: Note[];
  storageInfo?: {
    note_id: string;
    storage_url: string;
    created_at: string;
  };
}

export default function ResultsDisplay({
  transcript,
  tasks,
  events,
  notes,
  storageInfo,
}: ResultsDisplayProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-200 border-red-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-200 border-yellow-500/50";
      case "low":
        return "bg-green-500/20 text-green-200 border-green-500/50";
      default:
        return "bg-gray-500/20 text-gray-200 border-gray-500/50";
    }
  };

  const copyToClipboard = () => {
    const tasksText = tasks.map((t, i) => {
      let taskStr = `${i + 1}. ${t.title}${t.due_date ? ` (Due: ${t.due_date})` : ""} [${t.priority}]`;
      if (t.subtasks && t.subtasks.length > 0) {
        const subtasksStr = t.subtasks.map((st, si) =>
          `   ${si + 1}. ${st.completed ? "✓" : "○"} ${st.title}`
        ).join("\n");
        taskStr += "\n" + subtasksStr;
      }
      return taskStr;
    }).join("\n");

    const text = `
TRANSCRIPT:
${transcript}

TASKS (${tasks.length}):
${tasksText}

EVENTS (${events.length}):
${events.map((e, i) => `${i + 1}. ${e.title} - ${e.date}${e.time ? ` @ ${e.time}` : ""}`).join("\n")}

NOTES (${notes.length}):
${notes.map((n, i) => `${i + 1}. ${n.content}${n.category ? ` (${n.category})` : ""}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadJSON = () => {
    const data = { transcript, tasks, events, notes, storageInfo };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audio-note-${storageInfo?.note_id || Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Transcript */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/30">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📝</span>
          <h2 className="text-xl font-bold text-white">Transcript</h2>
        </div>
        <p className="text-purple-100 leading-relaxed">{transcript}</p>
      </div>

      {/* Tasks */}
      {tasks.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✅</span>
            <h2 className="text-xl font-bold text-white">Tasks ({tasks.length})</h2>
          </div>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-purple-300/20 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-purple-200 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                      {task.due_date && (
                        <span className="inline-block px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-200 border border-blue-500/50">
                          Due: {task.due_date}
                        </span>
                      )}
                    </div>

                    {/* Subtasks */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-purple-300 font-semibold uppercase tracking-wide">
                          Subtasks ({task.subtasks.length})
                        </p>
                        <div className="space-y-1.5">
                          {task.subtasks.map((subtask, subIndex) => (
                            <div
                              key={subIndex}
                              className="flex items-start gap-2 text-sm text-purple-200 bg-white/5 rounded px-3 py-2"
                            >
                              <span className="text-purple-400 mt-0.5">
                                {subtask.completed ? "✓" : "○"}
                              </span>
                              <span className={subtask.completed ? "line-through opacity-60" : ""}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Object */}
      <DebugObject
        data={{ transcript, tasks, events, notes, storageInfo }}
        title="Raw Response Data"
      />

      {/* Events */}
      {events.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📅</span>
            <h2 className="text-xl font-bold text-white">Events ({events.length})</h2>
          </div>
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-purple-300/20 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{event.title}</h3>
                    <p className="text-sm text-purple-200 mb-2">
                      {event.date}
                      {event.time && ` @ ${event.time}`}
                    </p>
                    {event.description && (
                      <p className="text-sm text-purple-300 mb-3">{event.description}</p>
                    )}
                  </div>
                </div>
                {event.calendar_link && (
                  <a
                    href={event.calendar_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add to Google Calendar
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📓</span>
            <h2 className="text-xl font-bold text-white">Notes ({notes.length})</h2>
          </div>
          <div className="space-y-3">
            {notes.map((note, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-purple-300/20 hover:bg-white/10 transition-colors"
              >
                <p className="text-purple-100 mb-2">{note.content}</p>
                {note.category && (
                  <span className="inline-block px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-200 border border-purple-500/50">
                    {note.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storage Info */}
      {storageInfo && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💾</span>
            <h2 className="text-xl font-bold text-white">Storage</h2>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-purple-200">
              <span className="font-semibold">Note ID:</span> {storageInfo.note_id}
            </p>
            <p className="text-purple-200">
              <span className="font-semibold">Saved:</span>{" "}
              {new Date(storageInfo.created_at).toLocaleString()}
            </p>
            <p className="text-purple-200 break-all">
              <span className="font-semibold">Location:</span> {storageInfo.storage_url}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={copyToClipboard}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy to Clipboard
        </button>
        <button
          onClick={downloadJSON}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download JSON
        </button>
      </div>
    </div>
  );
}
