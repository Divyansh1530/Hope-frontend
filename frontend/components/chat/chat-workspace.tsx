'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowUp,
  AudioLines,
  CalendarDays,
  Check,
  ChevronLeft,
  Copy,
  Download,
  FileText,
  Leaf,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { Brand } from '@/components/brand/hope-brand';
import { ThemeToggle } from '@/components/brand/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { type Thread, simulatedReply, textMessage, useThreads } from '@/lib/demo-conversations';

export function ChatWorkspace({ threadId }: { threadId?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { threads, ready, error, save, remove } = useThreads();
  const thread = threads.find((t) => t.id === threadId);

  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState('');
  const [voice, setVoice] = useState('');
  const [query, setQuery] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [copied, setCopied] = useState('');
  const textarea = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    textarea.current?.focus();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const missing = ready && threadId && !thread;

  function send(text: string) {
    const value = text.trim();
    if (!value || busy || missing) return;
    setInput('');
    setPending(value);
    setBusy(true);
    textarea.current?.focus();
    timer.current = setTimeout(() => {
      const next: Thread = {
        id: thread?.id ?? crypto.randomUUID(),
        title: thread?.title ?? value.slice(0, 42),
        date: 'Today',
        agent: thread?.agent ?? 'On-demand therapist',
        messages: [
          ...(thread?.messages ?? []),
          textMessage(crypto.randomUUID(), 'user', value),
          textMessage(crypto.randomUUID(), 'assistant', simulatedReply(value)),
        ],
        summary: `You shared: “${value}” This demo session made room to explore your feelings and consider what kind of support would feel helpful.`,
        themes: /work|stress|overwhelm/i.test(value)
          ? ['Feeling overwhelmed', 'Self-care']
          : ['Reflection', 'Emotional check-in'],
        takeaway: 'Take a moment to notice what you need today.',
      };
      save(next);
      setPending('');
      setBusy(false);
      textarea.current?.focus();
      if (!thread) {
        router.push(`/chat/${next.id}`);
      }
    }, 1300);
  }

  function download() {
    if (!thread) return;
    const content = `${thread.title}\n\nSUMMARY\n${thread.summary}\n\nTRANSCRIPT\n${thread.messages
      .map(
        (m) =>
          `${m.role.toUpperCase()}: ${m.parts
            .filter((p) => p.type === 'text')
            .map((p) => (p.type === 'text' ? p.text : ''))
            .join('\n')}`
      )
      .join('\n\n')}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${thread.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'Y';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';

  return (
    <div className={`workspace ${thread && summaryOpen ? 'has-summary' : ''}`}>
      <aside className={`history-panel ${historyOpen ? 'history-open' : ''}`}>
        <div className="panel-heading">
          <span>Your conversations</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close history"
            className="history-mobile-close"
            onClick={() => setHistoryOpen(false)}
          >
            <X />
          </Button>
        </div>
        <Button asChild className="new-conversation" variant="outline">
          <Link href="/chat">
            <Plus />
            New conversation
          </Link>
        </Button>
        <div className="therapist-top">
          <Button asChild variant="outline">
            <Link href="/voice?therapist=Weekly%20main%20therapist">
              <CalendarDays />
              <span>Weekly main therapist</span>
              <ArrowUp className="rotate-45" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/voice?therapist=Daily%20exercise%20therapist">
              <Leaf />
              <span>Daily exercise therapist</span>
              <ArrowUp className="rotate-45" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/voice?therapist=On-demand%20therapist">
              <AudioLines />
              <span>On-demand therapist</span>
              <ArrowUp className="rotate-45" />
            </Link>
          </Button>
        </div>
        <div className="history-search">
          <Search size={14} />
          <input
            aria-label="Search conversations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a moment…"
          />
        </div>
        <span className="section-eyebrow">YOUR RECENT MOMENTS</span>
        <div className="thread-list">
          {threads
            .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
            .map((t) => (
              <div key={t.id} className={`thread-row ${threadId === t.id ? 'thread-active' : ''}`}>
                <Link href={`/chat/${t.id}`} onClick={() => setHistoryOpen(false)}>
                  <MessageSquare size={14} />
                  <span>
                    {t.title}
                    <small>{t.date}</small>
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${t.title}`}
                  title="Delete conversation"
                  onClick={() => {
                    if (window.confirm(`Delete “${t.title}” from this browser?`)) {
                      remove(t.id);
                      if (threadId === t.id) router.push('/chat');
                    }
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          {threads.filter((t) => t.title.toLowerCase().includes(query.toLowerCase())).length ===
            0 && <p className="history-empty">No conversations found.</p>}
        </div>
        <div className="history-bottom">
          <div className="history-memory">
            <Leaf size={18} />
            <div>
              <strong>Your story is connected</strong>
              <p>A shared understanding across all three companions.</p>
            </div>
          </div>
          <Button asChild variant="ghost" className="back-home">
            <Link href="/">
              <ChevronLeft />
              Back to Hope
            </Link>
          </Button>
          <div className="demo-account">
            <span>{userInitial}</span>
            <div>
              {userName}
              <small>{user ? 'Your secure space' : 'Your personal demo space'}</small>
            </div>
          </div>
        </div>
      </aside>
      {(historyOpen || (thread && summaryOpen)) && (
        <div
          className={`panel-backdrop ${historyOpen ? 'backdrop-history' : 'backdrop-summary'}`}
          onClick={() => {
            setHistoryOpen(false);
            setSummaryOpen(false);
          }}
        />
      )}
      <main className="chat-main">
        <header className="chat-header">
          <div className="chat-header-start">
            <Brand compact />
            <span className="chat-header-divider" />
            <span>Your quiet space</span>
          </div>
          <div className="chat-header-tools">
            <ThemeToggle />
            {thread && !summaryOpen && (
              <Button
                variant="ghost"
                size="icon"
                title="Session summary"
                aria-label="Open summary"
                onClick={() => setSummaryOpen(true)}
              >
                <FileText />
              </Button>
            )}
            <span className="demo-label">Hope space</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle history"
              onClick={() => setHistoryOpen(!historyOpen)}
            >
              <Menu />
            </Button>
          </div>
        </header>
        {missing ? (
          <div className="chat-empty">
            <h1>This conversation isn&apos;t here.</h1>
            <p>It may have been deleted or saved in another browser.</p>
            <Button asChild>
              <Link href="/chat">Start a new conversation</Link>
            </Button>
          </div>
        ) : !thread && !busy ? (
          <div className="chat-empty">
            <span className="empty-mark">h.</span>
            <span className="section-eyebrow">TAKE A BREATH. YOU&apos;RE HERE.</span>
            <h1>What&apos;s on your mind?</h1>
            <p>
              You don’t need the right words.
              <br />
              Just start wherever you are.
            </p>
            <div className="starter-prompts">
              {[
                "I'm feeling a little overwhelmed",
                "I'd like a moment of calm",
                'I just need someone to listen',
              ].map((p) => (
                <Button
                  variant="outline"
                  key={p}
                  onClick={() => {
                    setInput(p);
                    textarea.current?.focus();
                  }}
                >
                  <MessageSquare />
                  {p}
                </Button>
              ))}
            </div>
            <span className="context-note">
              <Leaf size={12} /> A fresh moment, with your story in mind.
            </span>
          </div>
        ) : (
          <Conversation className="chat-conversation">
            <ConversationContent className="chat-transcript">
              <div className="conversation-date">
                {thread?.date ?? 'Today'} · {thread?.agent ?? 'On-demand therapist'}
              </div>
              {thread?.messages.map((m) => (
                <Message key={m.id} from={m.role} className="transcript-message">
                  {m.role === 'assistant' && <span className="agent-mark">h.</span>}
                  <MessageContent>
                    {m.parts.map((part, i) =>
                      part.type === 'text' ? (
                        <MessageResponse key={i}>{part.text}</MessageResponse>
                      ) : null
                    )}
                    {m.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="message-copy"
                        aria-label="Copy response"
                        title="Copy response"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              m.parts
                                .filter((p) => p.type === 'text')
                                .map((p) => (p.type === 'text' ? p.text : ''))
                                .join('')
                            );
                            setCopied(m.id);
                          } catch {
                            setCopied('');
                          }
                        }}
                      >
                        {copied === m.id ? <Check /> : <Copy />}
                      </Button>
                    )}
                  </MessageContent>
                </Message>
              ))}
              {busy && (
                <>
                  <Message from="user" className="transcript-message">
                    <MessageContent>{pending}</MessageContent>
                  </Message>
                  <Message from="assistant" className="transcript-message">
                    <span className="agent-mark">h.</span>
                    <MessageContent>
                      <Shimmer>Taking a moment…</Shimmer>
                    </MessageContent>
                  </Message>
                </>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}
        <div className="composer-wrap">
          {error && <p className="storage-error">{error}</p>}
          {thread && (
            <div className="session-controls">
              <span>
                <i />
                {thread.ended ? 'Session reflected' : 'A moment just for you'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy || thread.ended}
                onClick={() => {
                  save({ ...thread, ended: true });
                  setSummaryOpen(true);
                }}
              >
                {thread.ended ? (
                  <>
                    <Check />
                    Session complete
                  </>
                ) : (
                  'End session'
                )}
              </Button>
            </div>
          )}
          <PromptInput onSubmit={({ text }) => send(text)} className="chat-composer">
            <PromptInputTextarea
              ref={textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Your message"
              placeholder="Share what's on your mind…"
              disabled={Boolean(missing) || !ready}
            />
            <PromptInputFooter>
              <span className="composer-agent">Hope · Here for you</span>
              <div className="composer-actions">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  title="Talk to your on-demand therapist with LiveKit voice"
                  aria-label="On-demand voice therapist"
                >
                  <Link href="/voice?therapist=On-demand%20therapist">
                    <AudioLines />
                  </Link>
                </Button>
                <PromptInputSubmit
                  aria-label="Send message"
                  className="rounded-full"
                  status={busy ? 'submitted' : 'ready'}
                  disabled={busy || !input.trim() || !ready}
                >
                  <ArrowUp />
                </PromptInputSubmit>
              </div>
            </PromptInputFooter>
          </PromptInput>
          <p className="chat-safety">AI-guided support, not professional or emergency care.</p>
        </div>
      </main>
      <aside className={`summary-panel ${thread && summaryOpen ? 'summary-visible' : ''}`}>
        <div className="panel-heading">
          <span>
            <FileText size={15} /> Session summary
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close summary"
            onClick={() => setSummaryOpen(false)}
          >
            <X />
          </Button>
        </div>
        {thread && (
          <>
            <span className="section-eyebrow">YOUR MOMENT, REFLECTED</span>
            <h2>{thread.title}</h2>
            <div className="session-meta">
              {thread.date} · {thread.agent}
            </div>
            <h3>What we explored</h3>
            <p>{thread.summary}</p>
            <h3>Threads of your story</h3>
            <div className="theme-tags">
              {thread.themes.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <h3>A little thing to carry with you</h3>
            <div className="takeaway">
              <Leaf size={17} />
              <p>{thread.takeaway}</p>
            </div>
            <div className="memory-status">
              <Check size={14} />
              <span>Included in your shared memory</span>
            </div>
            <Button variant="outline" className="download-button" onClick={download}>
              <Download /> Download conversation
            </Button>
            <small className="summary-disclaimer">Summary · Not a clinical assessment</small>
          </>
        )}
      </aside>
      <Dialog
        open={Boolean(voice)}
        onOpenChange={(open) => {
          if (!open) setVoice('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <span className="voice-dialog-icon">
              <AudioLines />
            </span>
            <DialogTitle>{voice}</DialogTitle>
            <DialogDescription>
              Connect to your live session with {voice} using the LiveKit voice agent.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild>
              <Link href={`/voice?therapist=${encodeURIComponent(voice)}`}>
                Start LiveKit Voice Session
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => setVoice('')}>
              Continue in chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
