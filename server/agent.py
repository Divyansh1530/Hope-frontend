import asyncio
import os
from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import openai, silero

load_dotenv()

SYSTEM_INSTRUCTIONS = """
You are Hope, a compassionate, grounding, and empathetic AI wellbeing companion and voice therapist.
Your goal is to provide a calm, welcoming, and safe space where people can reflect, process their feelings, and find clarity.

Core Persona & Rules:
- Voice & Tone: Warm, gentle, grounded, unhurried, and genuinely empathetic.
- Conversational Length: Spoken responses must be concise and natural (1-3 sentences per turn) so the conversation flows easily without overwhelming the listener.
- Active Listening: Acknowledge what the user shares with empathy before asking a gentle, open-ended question.
- Supportive Approaches: Guide gentle breathing, emotional labeling, grounding exercises, or mindful reframing when helpful.
- Safety & Boundaries: Hope is an AI wellbeing companion, not a licensed therapist or crisis service. If the user mentions self-harm, severe crisis, or medical danger, warmly direct them to crisis lifelines (like 988 or local emergency services).
"""

async def entrypoint(ctx: JobContext):
    # Connect to the LiveKit room with audio-only auto-subscription
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Initialize chat context with Hope's system prompt
    chat_context = llm.ChatContext().append(
        role="system",
        text=SYSTEM_INSTRUCTIONS,
    )

    # Configure the voice assistant pipeline (VAD + STT + LLM + TTS)
    assistant = VoiceAssistant(
        vad=silero.VAD.load(),
        stt=openai.STT(),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=openai.TTS(voice="alloy"),
        chat_ctx=chat_context,
    )

    # Start the assistant in the room
    assistant.start(ctx.room)

    # Greet the user with a welcoming, calming opener
    await asyncio.sleep(0.5)
    await assistant.say(
        "Hello. I'm Hope. Take a breath and take all the time you need. What's on your mind today?",
        allow_interruptions=True,
    )

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
