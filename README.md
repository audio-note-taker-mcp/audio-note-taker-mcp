# Audio Note Taker - AI Voice Notes with MCP

Transform voice recordings into actionable tasks, calendar events, and structured notes using AI agent workflows powered by Claude and MCP (Model Context Protocol).

## Overview

This project demonstrates an end-to-end AI agent workflow that:
1. Ingests audio recordings from users
2. Transcribes audio using Deepgram
3. Extracts actionable items using Claude AI
4. Saves structured data to storage
5. Generates calendar event links

**Built with:**
- Next.js 15 + TypeScript
- MCP (Model Context Protocol) for tool chaining
- Claude AI (Anthropic) for intelligent extraction
- Deepgram for speech-to-text
- AWS S3 for storage (optional)

## Architecture

```
User Audio → Next.js Frontend → Claude AI Agent
                                      ↓
                              MCP Tools Chain:
                              1. transcribe_audio
                              2. extract_tasks
                              3. save_note
                              4. create_calendar_event
```

Claude orchestrates the workflow by automatically chaining MCP tools based on the input.

## MCP Tools Implemented

### 1. `transcribe_audio`
- **Purpose**: Transcribes audio using Deepgram API
- **Input**: Base64 audio data or URL
- **Output**: Transcript text, duration, confidence score

### 2. `extract_tasks`
- **Purpose**: Analyzes transcript and extracts structured data
- **Input**: Transcript text
- **Output**: Tasks, calendar events, and notes

### 3. `save_note`
- **Purpose**: Saves processed notes to S3 or local filesystem
- **Input**: All extracted data
- **Output**: Note ID and storage URL

### 4. `create_calendar_event`
- **Purpose**: Generates Google Calendar event links
- **Input**: Event details (title, date, time)
- **Output**: Calendar link for easy adding

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` file:

```env
# Required
DEEPGRAM_API_KEY=your_deepgram_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional (for S3 storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=audio-notes-bucket
```

**Get API Keys:**
- Deepgram: https://console.deepgram.com/
- Anthropic: https://console.anthropic.com/

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing the MCP Server

Test your MCP tools using the included test client:

```bash
node scripts/test-client.mjs http://localhost:3000
```

This will connect to your local MCP server and list available tools.

## Deployment

### Deploy to AWS Amplify

1. **Connect Repository**
   - Create new app in AWS Amplify
   - Connect to your Git repository

2. **Configure Build Settings**
   - Build command: `pnpm install && pnpm build`
   - Output directory: `.next`

3. **Add Environment Variables**
   - Add all environment variables from `.env.local`
   - Ensure they're marked as secret where appropriate

4. **Deploy**
   - Amplify will automatically build and deploy
   - SSL certificate generated automatically

### Deploy to Vercel (Alternative)

```bash
vercel deploy
```

Add environment variables in Vercel dashboard.

**Note for Vercel:**
- Enable [Fluid Compute](https://vercel.com/docs/functions/fluid-compute)
- Adjust `maxDuration` in `app/mcp/route.ts` if using Pro/Enterprise

## Project Structure

```
mcp-for-next.js/
├── app/
│   ├── mcp/
│   │   └── route.ts          # MCP tools implementation
│   ├── page.tsx               # Homepage
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── scripts/
│   └── test-client.mjs        # MCP test client
├── .env.example               # Environment variables template
└── MCP_TOOLS_DESIGN.md        # Detailed tool design doc
```

## Example Workflow

**User input (voice):**
> "Remind me to follow up with Sarah about the Q4 budget by Friday and schedule a team sync next Tuesday at 2pm"

**Claude's tool chain:**
1. `transcribe_audio()` → Returns transcript
2. `extract_tasks()` → Extracts:
   - Task: "Follow up with Sarah about Q4 budget" (due: Friday)
   - Event: "Team sync" (date: next Tuesday, 2pm)
3. `save_note()` → Saves to storage
4. `create_calendar_event()` → Generates calendar link

**Result:** Structured, actionable data ready to use!

## Development Notes

- **Storage fallback**: If AWS credentials aren't configured, notes save to local `data/notes/` directory
- **Error handling**: Each tool gracefully handles missing API keys and returns helpful error messages
- **Verbose logging**: Enable in `app/mcp/route.ts` for debugging

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [MCP Handler](https://www.npmjs.com/package/mcp-handler) - Vercel's MCP adapter
- [Deepgram SDK](https://github.com/deepgram/deepgram-node-sdk) - Speech-to-text
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) - Claude AI
- [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) - S3 storage
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## License

MIT
