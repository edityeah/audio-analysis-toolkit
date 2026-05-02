# AI-Powered Audio Analysis Toolkit

A powerful, Python-based toolkit for transcribing and analyzing audio using [AssemblyAI](https://www.assemblyai.com/).  

We use the following tech stack:

- AssemblyAI for audio transcription and analysis (audio-RAG)
- Streamlit for the interactive web UI
- Cursor as the MCP host for programmatic access

## 🚀 Features

### Audio Transcription
- Speaker-labeled, timestamped transcription
- Supports `.mp3`, `.wav`, `.mp4`, `.m4a`, and `.flac`

### Audio Intelligence & Analysis
- Sentiment detection (Positive/Neutral/Negative)
- Speaker diarization
- Topic extraction (IAB categories)
- Auto-summary generation
- Ask-anything chatbot based on transcript

### Dual Modes of Use
1. **Streamlit UI** – For interactive web usage  
2. **MCP Server (Model Context Protocol)** – For Claude + Cursor integration

## Setup and Installation

Ensure you have Python 3.12 or later installed on your system.

### Install dependencies

```bash
# Clone the repository and navigate to the project directory
# git clone <your-repo-url>
cd project-name

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# MacOS/Linux
source .venv/bin/activate
# Windows
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Configure environment variables
Copy `.env.example` to `.env` and configure the following environment variables:

```
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

## Usage

### 1. Run as a Streamlit App (Interactive UI)

Launch the web app for interactive audio analysis:

```bash
streamlit run app.py
```

- **Upload Audio**: Drag and drop or browse for audio files (WAV, MP3, MP4, M4A, FLAC)
- **Processing**: The app automatically processes your audio with AssemblyAI
- **Analysis**: Navigate through different tabs to explore results:
  - View timestamped transcription
  - Read AI-generated summaries
  - Analyze speaker patterns
  - Explore sentiment analysis
  - Discover key topics
  - Chat with your audio content

### 2. Run as an MCP Server (for Cursor/Agent Integration)

First, set up your MCP server as follows:

1. Go to Cursor settings
2. Select MCP Tools
3. Add new global MCP server.
4. In the JSON file, add this:

```json
{
    "mcpServers": {
        "assemblyai": {
            "command": "python",
            "args": [
                "server.py"
            ],
            "env": {
                "ASSEMBLYAI_API_KEY": "YOUR_ASSEMBLYAI_API_KEY"
            }
        }
    }
}
```
You should now be able to see the MCP server listed in the MCP settings. In Cursor MCP settings make sure to toggle the button to connect the server to the host.

Done! Your server is now up and running.

## MCP Tools

The custom MCP server provides the following tools:

- **transcribe_audio**: Ingests and transcribes audio, returning sentences with timestamps
- **get_audio_data**: Retrieves features from the last transcript, including:
  - Full transcript text
  - Timestamped sentences
  - Summary
  - Speaker labels
  - Sentiment analysis
  - Topic categories

You can now ingest your audio files, retrieve relevant data, and query it all using the Cursor Agent or any MCP-compatible client. The agent can analyze, summarize, and answer questions about your audio just with a single query.

## 📬 Stay Updated with MY Newsletter!

Our lives are dominated by software, but we don’t understand it very well!
You might work at a tech company, a bank, a financial services firm, or in healthcare, but there’s one common thread that pervades your professional circles: software. This is probably one of the 8+ hours a day that you spend using your phone or computer (check your screen time: it’s depressing). And man, software is complicated.

Ideally, we’d all love to understand what an API is, how to talk to your coworkers about programming languages, and why your laptop won’t connect to the goddamn airport WiFi. But this stuff is hard. You’ve tried googling things you don’t get, but every concept seems to require understanding another concept, and the people writing these guides aren’t very…er…engaging. That’s what this blog is for.
(https://news.adityeah.in/)

## Contribution

Contributions are welcome! Feel free to fork this repository and submit pull requests with your improvements.

## Author
Aditya Chaudhari <br>
🚀 Building AI-first products at scale <br>
🔗 Visit My Blog: https://news.adityeah.in/  
💼 LinkedIn: https://www.linkedin.com/in/adityacbcc/
