import { ChatWorkspace } from '@/components/chat/chat-workspace';
import { constructMetadata } from '@/lib/site';

export const metadata = constructMetadata({
  title: 'Your Space · Conversations',
  description: 'A quiet, personal space for thoughtful reflection and conversations.',
});

export default function ChatPage() {
  return <ChatWorkspace />;
}
