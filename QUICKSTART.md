# Quick Start Guide

Get your Audio Note Taker up and running in 5 minutes!

## Step 1: Get API Keys

### Deepgram (Speech-to-Text)
1. Go to https://console.deepgram.com/
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `DG_...`)

### Anthropic (Claude AI)
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy the key (starts with `sk-ant-...`)

## Step 2: Configure Environment

Create `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and paste your API keys:

```env
DEEPGRAM_API_KEY=DG_your_key_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
```

## Step 3: Run the App

```bash
pnpm dev
```

Open http://localhost:3000

## Step 4: Test the MCP Server

In a new terminal:

```bash
node scripts/test-client.mjs http://localhost:3000
```

You should see the 4 available MCP tools listed.

## What's Next?

### Option 1: Build a Frontend Demo Page
- Create audio recording UI
- Call Claude API with MCP tools
- Display results in real-time

### Option 2: Test Tools Manually
You can test individual tools by making API calls to your MCP server endpoints.

### Option 3: Deploy to AWS
1. Push code to GitHub
2. Create AWS Amplify app
3. Connect repository
4. Add environment variables
5. Deploy!

## Hackathon Tips

1. **Keep it simple**: Start with mock audio transcripts instead of real recording
2. **Demo script**: Prepare a 30-second voice note example
3. **Visual flow**: Create a diagram showing the MCP tool chain
4. **Fallbacks**: Have a backup video demo in case of issues

## Troubleshooting

**Error: "Deepgram API key not configured"**
- Make sure `.env.local` exists and contains your API key
- Restart the dev server after adding environment variables

**Error: "Module not found"**
- Run `pnpm install` again
- Delete `node_modules` and `.next` folders, then reinstall

**Tools not showing up**
- Check the MCP server logs in your terminal
- Verify `app/mcp/route.ts` compiled without errors

## Need Help?

Check the main [README.md](README.md) for full documentation.
