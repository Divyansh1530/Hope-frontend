'use client';

import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import type { UIMessage } from 'ai';

export type Thread = {
  id: string;
  title: string;
  date: string;
  agent: string;
  messages: UIMessage[];
  summary: string;
  themes: string[];
  takeaway: string;
  ended?: boolean;
};

const textMessage = (id: string, role: 'user' | 'assistant', text: string): UIMessage => ({
  id,
  role,
  parts: [{ type: 'text', text }],
});

export const demoThreads: Thread[] = [
  {
    id: 'finding-a-little-balance',
    title: 'Finding a little balance',
    date: 'Today',
    agent: 'On-demand therapist',
    messages: [
      textMessage(
        'b1',
        'user',
        "I've been feeling pulled in so many directions. Work has been busy and I haven't had much time for myself."
      ),
      textMessage(
        'b2',
        'assistant',
        "It sounds like you've been giving a lot of yourself lately, with very little room to recharge. That can feel exhausting.\n\nWhen you think about having a little time just for you, what would that look like?"
      ),
      textMessage(
        'b3',
        'user',
        'Honestly, just going for a walk without checking my phone. I used to do that every evening.'
      ),
      textMessage(
        'b4',
        'assistant',
        "That sounds like a small but meaningful way to come back to yourself. You already know something that feels good for you.\n\nWhat if you gave yourself ten minutes for that walk today — not as another thing to achieve, but as a moment that's yours?"
      ),
    ],
    summary:
      'You explored feeling stretched between work and your own needs. Evening walks emerged as a familiar, restorative practice that you’d like to return to.',
    themes: ['Work–life balance', 'Self-care', 'Feeling overwhelmed'],
    takeaway: 'Make space for a ten-minute, phone-free walk.',
  },
  {
    id: 'a-calmer-morning',
    title: 'A calmer morning',
    date: 'Yesterday',
    agent: 'Daily exercise therapist',
    messages: [
      textMessage('m1', 'user', 'I want to start the day feeling less rushed.'),
      textMessage(
        'm2',
        'assistant',
        "Let's take a moment before the day begins. Feel your feet on the ground, and let your shoulders soften.\n\nBreathe in slowly, then let the breath out a little longer. What is one thing you'd like to carry into today?"
      ),
      textMessage('m3', 'user', 'A bit more patience with myself.'),
      textMessage(
        'm4',
        'assistant',
        'A little more patience is a kind intention. You can return to it whenever you notice yourself rushing. For now, one breath is enough.'
      ),
    ],
    summary:
      'A grounding check-in focused on slowing down before the day begins. You chose patience with yourself as your daily intention.',
    themes: ['Grounding', 'Self-compassion'],
    takeaway: 'Pause for one slow breath before reaching for your phone.',
  },
  {
    id: 'making-room-for-myself',
    title: 'Making room for myself',
    date: 'Last week',
    agent: 'Weekly main therapist',
    messages: [
      textMessage('w1', 'user', 'This week I noticed I say yes even when I need a break.'),
      textMessage(
        'w2',
        'assistant',
        "Noticing that pattern is an important moment. Saying yes can feel easier in the short term, even when it costs you the rest you need.\n\nWhat comes up for you when you imagine saying, 'I need some time for myself'?"
      ),
      textMessage('w3', 'user', 'I worry about letting people down.'),
      textMessage(
        'w4',
        'assistant',
        'That worry makes sense when you care about the people around you. Your needs belong in that picture too. We can explore a small boundary that feels comfortable, rather than trying to change everything at once.'
      ),
    ],
    summary:
      'You reflected on saying yes when you need rest, and the worry about disappointing others. The conversation explored gentle boundaries.',
    themes: ['Boundaries', 'Relationships', 'Rest'],
    takeaway: 'Try one gentle boundary with someone you trust.',
  },
];

const key = 'still-demo-conversations-v1';

type Store = {
  threads: Thread[];
  ready: boolean;
  error: string;
  save: (thread: Thread) => void;
  remove: (id: string) => void;
};

const ThreadContext = createContext<Store | null>(null);

export function ThreadProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>(demoThreads);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (
          Array.isArray(parsed) &&
          parsed.every((t) => t && typeof t.id === 'string' && Array.isArray(t.messages))
        )
          setThreads(parsed);
      } else {
        localStorage.setItem(key, JSON.stringify(demoThreads));
      }
    } catch {
      setError("This browser couldn't save your conversations.");
    }
    setReady(true);
  }, []);

  function update(next: Thread[]) {
    setThreads(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      setError("This browser couldn't save your conversations.");
    }
  }

  return (
    <ThreadContext.Provider
      value={{
        threads,
        ready,
        error,
        save: (thread) => update([thread, ...threads.filter((t) => t.id !== thread.id)]),
        remove: (id) => update(threads.filter((t) => t.id !== id)),
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
}

export function useThreads() {
  const store = useContext(ThreadContext);
  if (!store) throw new Error('Conversation provider is missing');
  return store;
}

export { textMessage };

export function simulatedReply(text: string) {
  if (/danger|suicid|kill myself|hurt myself/i.test(text))
    return "I'm sorry you're feeling this much pain. This demo cannot provide crisis care. If you're in immediate danger, call your local emergency number now. You can also reach out to someone you trust or a local crisis service.";
  if (/work|overwhelm|stress/i.test(text))
    return "It sounds like there's a lot asking for your attention right now. You don't need to sort everything out at once.\n\nWhat feels like the heaviest part of it today? We can start there, at your pace.";
  return "Thank you for sharing that. We can take a moment with what you're feeling, without needing to change it right away.\n\nWhat would feel most helpful right now — making sense of it, or simply having a little space to talk?";
}
