/**
 * LiveKit voice client helpers and configurations for Hope Voice Assistant.
 */

export interface LiveKitConnectionDetails {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
}

export const LIVEKIT_CONFIG = {
  tokenEndpoint: '/api/token',
  defaultCompanion: 'On-demand therapist',
  therapistAgents: {
    weekly: {
      name: 'Your weekly anchor',
      label: 'Weekly main therapist',
      agent: 'weekly-anchor',
    },
    daily: {
      name: 'Your daily reset',
      label: 'Daily exercise therapist',
      agent: 'daily-reset',
    },
    ondemand: {
      name: 'Your anytime support',
      label: 'On-demand therapist',
      agent: 'ondemand-support',
    },
  },
};

/**
 * Fetch a participant token for the voice agent room.
 */
export async function fetchLiveKitToken(
  therapistTitle?: string
): Promise<LiveKitConnectionDetails> {
  const res = await fetch(LIVEKIT_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      therapist: therapistTitle || LIVEKIT_CONFIG.defaultCompanion,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch LiveKit token: ${errorText}`);
  }

  return (await res.json()) as LiveKitConnectionDetails;
}
