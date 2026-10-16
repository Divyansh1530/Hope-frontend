import { App } from '@/components/app/app';
import { constructMetadata } from '@/lib/site';

export const metadata = constructMetadata({
  title: 'Voice Session · Hope',
  description: 'Live voice space to speak freely, reflect, and feel heard in real-time.',
});

const tokenServerId = process.env.LIVEKIT_TOKEN_SERVER_ID;
const isHomepageAgent = !tokenServerId && !process.env.LIVEKIT_URL;
const tokenEndpoint = isHomepageAgent
  ? 'https://livekit.com/api/homepage-agent/token'
  : '/api/token';

export default async function VoicePage({
  searchParams,
}: {
  searchParams?: Promise<{ therapist?: string; agent?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const therapistTitle = resolvedParams?.therapist || resolvedParams?.agent;

  return (
    <App
      tokenServerId={tokenServerId}
      tokenEndpoint={tokenEndpoint}
      agentName={process.env.AGENT_NAME}
      isVideoInputSupported={!isHomepageAgent}
      therapistTitle={therapistTitle}
    />
  );
}
