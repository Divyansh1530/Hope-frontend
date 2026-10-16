# Hope — AI Therapist & Wellbeing Companion

> AI-guided conversations, daily practices, and a calm, safe space to feel heard.

Hope is an empathetic, voice-first AI wellbeing companion and conversational therapist. The project consists of a modern Next.js web application frontend and a Python-powered LiveKit realtime voice agent backend.

---

## 📁 Repository Structure

```
Ai-Therapist/
├── frontend/             # Next.js 15 + React 19 + TypeScript web app
│   ├── app/              # App router (marketing, auth, voice sessions, etc.)
│   ├── components/       # UI components & LiveKit audio/visualizer widgets
│   ├── contexts/         # React state providers
│   ├── lib/              # Supabase & LiveKit utilities
│   ├── public/           # Static assets and illustrations
│   └── styles/           # CSS design system and themes
└── server/               # Python LiveKit Voice Agent backend
    ├── agent.py          # Real-time voice agent entrypoint (VAD, LLM, TTS)
    ├── requirements.txt  # Python agent dependencies
    └── .env.example      # Example server environment configuration
```

---

## 🚀 Quick Start

### 1. Backend Server Setup

The backend handles the real-time voice pipeline (VAD + STT + LLM + TTS) using LiveKit Agents.

```bash
cd server

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Fill in LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and OPENAI_API_KEY

# Run the agent in development mode
python agent.py dev
```

### 2. Frontend Setup

The frontend provides the voice interface, audio visualizers, and session controls.

```bash
cd frontend

# Install dependencies (pnpm recommended)
pnpm install

# Configure environment variables
cp .env.example .env.local
# Set your LiveKit and Supabase credentials in .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Privacy & Safety Notice

Hope is designed as an AI wellbeing companion and reflective space. It is not a licensed therapist or crisis intervention service.
