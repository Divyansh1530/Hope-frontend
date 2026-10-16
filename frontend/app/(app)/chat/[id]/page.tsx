import { ChatWorkspace } from '@/components/chat/chat-workspace';
import { constructMetadata } from '@/lib/site';

export const metadata = constructMetadata({
  title: 'Your Space · Conversation',
  description: 'Your private, thoughtful conversation space.',
});

export default async function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ChatWorkspace threadId={resolvedParams.id} />;
}
