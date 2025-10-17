export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl w-full mx-auto space-y-10">
        <h1 className="text-5xl font-bold text-white mb-8">Audio Note Taker</h1>
        <p className="text-xl text-purple-200 mb-10">
          AI-powered voice notes that transform into actionable tasks
        </p>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">How it works</h2>
          <div className="space-y-6 text-purple-100">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🎤</span>
              <div>
                <h3 className="font-semibold text-white">
                  1. Record Your Note
                </h3>
                <p className="text-sm">
                  Speak naturally about tasks, meetings, or ideas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">🤖</span>
              <div>
                <h3 className="font-semibold text-white">2. AI Processing</h3>
                <p className="text-sm">
                  Claude AI chains MCP tools: Deepgram transcription → Task
                  extraction → Storage
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="font-semibold text-white">3. Get Results</h3>
                <p className="text-sm">
                  Structured tasks, calendar events, and notes ready to use
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            MCP Tools Available
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-purple-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">
                transcribe_audio
              </h3>
              <p className="text-sm text-purple-200">
                Transcribes audio using Deepgram API
              </p>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-2">extract_tasks</h3>
              <p className="text-sm text-purple-200">
                Extracts tasks, events, and notes using Claude AI
              </p>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">save_note</h3>
              <p className="text-sm text-purple-200">
                Saves processed notes to S3 or local storage
              </p>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">
                create_calendar_event
              </h3>
              <p className="text-sm text-purple-200">
                Generates Google Calendar event links
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href="/demo"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-10 py-5 rounded-xl transition-colors shadow-lg"
          >
            Try Demo
          </a>
        </div>
      </div>
    </main>
  );
}
