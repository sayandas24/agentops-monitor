# Setup Instructions

## Quick Answer to Your Question

**No, you don't need Vertex AI credentials!** 

The error message gives you two options:
- **Option 1 (Easy):** Use Google AI API with just an `api_key` ✅ **Use this one!**
- **Option 2 (Complex):** Use Vertex AI with `vertexai`, `project`, and `location`

We're using Option 1, which only requires a free Gemini API key.

## What You Need

### 1. Google Gemini API Key (Required to run the agent)
This is the API key for Google's Gemini AI model.

**How to get it:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

**How to use it:**
Add it to your `.env` file:
```bash
GOOGLE_API_KEY=AIzaSy...your-actual-key-here
```

Or set it as an environment variable:
```bash
export GOOGLE_API_KEY='AIzaSy...your-actual-key-here'
```

### 2. AgentOps API Key (Optional - for monitoring)
This is for the monitoring backend (your AgentOps project).

Already set in `.env`:
```bash
AGENTOPS_API_KEY=agentops_test_key_12345678901234567890
```

## Running the Test

Once you've added your `GOOGLE_API_KEY` to the `.env` file:

```bash
cd examples
python test_adk_agent.py
```

## What Each Key Does

| Key | Purpose | Required? |
|-----|---------|-----------|
| `GOOGLE_API_KEY` | Runs the Gemini AI agent | ✅ Yes |
| `AGENTOPS_API_KEY` | Sends monitoring data to your backend | ⚠️ Optional (will warn if missing) |

## Troubleshooting

### Error: "Missing key inputs argument!"
**Solution:** Add `GOOGLE_API_KEY` to your `.env` file (see above)

### Error: "Invalid API key" (from AgentOps)
**This is OK!** It means:
- The monitoring wrapper is working correctly ✅
- The test API key isn't valid for the backend (expected)
- The agent will still run fine

### Connection refused to localhost:8000
**This is OK!** It means:
- The monitoring backend isn't running (expected for testing)
- The agent will still run fine
- Monitoring data just won't be sent anywhere

## Summary

You only need **one thing** to make this work:
1. Get a free Gemini API key from https://aistudio.google.com/app/apikey
2. Add it to `.env` as `GOOGLE_API_KEY=your-key-here`
3. Run the test

That's it! No Vertex AI, no Google Cloud project, no complex setup needed.
