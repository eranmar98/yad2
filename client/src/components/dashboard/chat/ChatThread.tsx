import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import axios from 'axios';
import {
  HiArrowRight,
  HiCheck,
  HiOutlineExclamationCircle,
  HiOutlinePhone,
  HiPaperAirplane,
} from 'react-icons/hi2';
import InquiriesServices, {
  type ChatMessage,
  type ChatThread as ChatThreadData,
  type Conversation,
} from '../../../services/inquiriesServices';
import usePolling from '../../../hooks/usePolling';
import ChatAvatar from './ChatAvatar';
import { displayName, formatClock, formatDayLabel, isSameDay, roleLabel } from './chatUtils';

const THREAD_POLL_MS = 3000;
const GROUP_GAP_MS = 5 * 60 * 1000;
const MAX_LENGTH = 2000;

const QUICK_REPLIES = {
  seller: ['כן, הפריט עדיין זמין', 'מתי נוח לך לבוא לראות?', 'המחיר גמיש במעט'],
  buyer: ['הפריט עדיין זמין?', 'אפשר לסגור על מחיר?', 'מאיפה אפשר לאסוף?'],
};

type PendingMessage = {
  tempId: string;
  text: string;
  createdAt: string;
  failed: boolean;
};

type ChatThreadProps = {
  conversationId: string;
  // Summary from the list, so the header renders before the thread loads.
  fallback: Conversation | null;
  onBack: () => void;
  onRead: (conversationId: string) => void;
  onMessageSent: (conversationId: string, message: ChatMessage) => void;
};

export default function ChatThread({
  conversationId,
  fallback,
  onBack,
  onRead,
  onMessageSent,
}: ChatThreadProps) {
  const [thread, setThread] = useState<ChatThreadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  // Messages this tab sent that a poll hasn't returned yet, and ones still in flight.
  const [sent, setSent] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [draft, setDraft] = useState('');

  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await InquiriesServices.getThread(conversationId);
      setThread(data);
      setNotFound(false);
      onRead(conversationId);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, onRead]);

  usePolling(load, THREAD_POLL_MS);

  const conversation = thread?.conversation ?? fallback;
  const serverMessages = thread?.messages ?? [];
  const serverIds = new Set(serverMessages.map((m) => m._id));
  const messages = [...serverMessages, ...sent.filter((m) => !serverIds.has(m._id))].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const otherLastReadAt = thread?.otherLastReadAt ? new Date(thread.otherLastReadAt) : null;
  const hasMyMessage = messages.some((m) => m.isMine);

  // Follow new messages only if the user is already at the bottom (or just sent one).
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages.length, pending.length, isLoading]);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // Grow the composer with its content, up to a cap.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [draft]);

  const deliver = async (text: string) => {
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    stickToBottomRef.current = true;
    setPending((prev) => [...prev, { tempId, text, createdAt: new Date().toISOString(), failed: false }]);

    try {
      const message = await InquiriesServices.sendMessage(conversationId, text);
      setPending((prev) => prev.filter((p) => p.tempId !== tempId));
      setSent((prev) => [...prev, message]);
      onMessageSent(conversationId, message);
    } catch {
      setPending((prev) => prev.map((p) => (p.tempId === tempId ? { ...p, failed: true } : p)));
    }
  };

  const retry = (tempId: string) => {
    const message = pending.find((p) => p.tempId === tempId);
    if (!message) return;
    setPending((prev) => prev.filter((p) => p.tempId !== tempId));
    deliver(message.text);
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    deliver(text);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (notFound) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <HiOutlineExclamationCircle className="h-10 w-10 text-ink/25" />
        <p className="font-sans text-sm text-ink/60">השיחה לא נמצאה</p>
        <button type="button" onClick={onBack} className="font-sans text-sm font-medium text-navy hover:underline">
          חזרה לשיחות
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onBack}
          aria-label="חזרה לשיחות"
          className="-mr-1 rounded-full p-2 text-ink/60 transition-colors duration-150 ease-out hover:bg-ink/5 hover:text-ink lg:hidden"
        >
          <HiArrowRight className="h-5 w-5" />
        </button>

        {conversation ? (
          <>
            <ChatAvatar conversation={conversation} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2">
                <span className="truncate font-display font-bold text-ink">{displayName(conversation)}</span>
                <span className="shrink-0 rounded-pill bg-navy/[0.07] px-2 py-0.5 font-sans text-[10px] font-medium text-navy">
                  {roleLabel(conversation)}
                </span>
              </p>
              <p className="truncate font-sans text-xs text-ink/55">
                {conversation.item ? (
                  <>
                    {conversation.item.title}
                    <span className="mx-1.5 text-ink/25">·</span>
                    <span className="font-medium text-navy">{conversation.item.price.toLocaleString('he-IL')} ₪</span>
                  </>
                ) : (
                  'מודעה שהוסרה'
                )}
              </p>
            </div>
            {conversation.otherUser?.phone && (
              <a
                href={`tel:${conversation.otherUser.phone}`}
                title={conversation.otherUser.phone}
                aria-label={`התקשרות ל${displayName(conversation)}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-navy/15 text-navy transition-colors duration-150 ease-out hover:bg-navy/5 active:scale-95"
              >
                <HiOutlinePhone className="h-4.5 w-4.5" />
              </a>
            )}
          </>
        ) : (
          <div className="h-12 flex-1 animate-pulse rounded-xl bg-ink/[0.04]" />
        )}
      </div>

      {conversation?.item?.status === 'Sold' && (
        <p className="border-b border-ink/10 bg-amber-50 px-5 py-2 text-center font-sans text-xs text-amber-800">
          הפריט סומן כנמכר
        </p>
      )}

      {/* Messages */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_1px_1px,rgb(21_42_78/0.05)_1px,transparent_0)] bg-[length:20px_20px] px-4 py-5 sm:px-6"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((message, i) => {
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const newDay = !prev || !isSameDay(prev.createdAt, message.createdAt);
              const startsGroup =
                newDay ||
                prev.isMine !== message.isMine ||
                new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() > GROUP_GAP_MS;
              const endsGroup =
                !next ||
                !isSameDay(message.createdAt, next.createdAt) ||
                next.isMine !== message.isMine ||
                new Date(next.createdAt).getTime() - new Date(message.createdAt).getTime() > GROUP_GAP_MS;
              const isSeen = Boolean(otherLastReadAt && otherLastReadAt >= new Date(message.createdAt));

              return (
                <div key={message._id} className="flex flex-col">
                  {newDay && <DaySeparator label={formatDayLabel(message.createdAt)} />}
                  <Bubble
                    text={message.text}
                    isMine={message.isMine}
                    className={startsGroup && !newDay ? 'mt-3' : 'mt-1'}
                    tail={endsGroup}
                  />
                  {endsGroup && (
                    <MessageMeta isMine={message.isMine} time={formatClock(message.createdAt)} seen={isSeen} />
                  )}
                </div>
              );
            })}

            {pending.map((message) => (
              <div key={message.tempId} className="flex flex-col">
                <Bubble text={message.text} isMine className="mt-1" tail dimmed={!message.failed} />
                {message.failed ? (
                  <button
                    type="button"
                    onClick={() => retry(message.tempId)}
                    className="mt-1 flex items-center gap-1 self-start font-sans text-[11px] font-medium text-red-600 hover:underline"
                  >
                    <HiOutlineExclamationCircle className="h-3.5 w-3.5" />
                    לא נשלח · לחצו לשליחה חוזרת
                  </button>
                ) : (
                  <p className="mt-1 self-start font-sans text-[11px] text-ink/40">שולח...</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-ink/10 bg-white px-3 pt-2.5 pb-3 sm:px-4">
        {!isLoading && !hasMyMessage && conversation && (
          <div className="no-scrollbar mb-2.5 flex gap-1.5 overflow-x-auto">
            {QUICK_REPLIES[conversation.role].map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => {
                  setDraft(reply);
                  textareaRef.current?.focus();
                }}
                className="shrink-0 rounded-pill border border-navy/15 bg-navy/[0.03] px-3 py-1.5 font-sans text-xs text-navy transition-colors duration-150 ease-out hover:bg-navy/[0.08] active:scale-[0.97]"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="כתבו הודעה..."
            aria-label="הודעה"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl border border-ink/10 bg-ink/[0.03] px-4 py-2.5 font-sans text-sm leading-6 text-ink outline-none transition-colors duration-150 ease-out placeholder:text-ink/40 focus:border-navy focus:bg-white"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="שליחה"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-navy text-white shadow-sm transition-[transform,opacity] duration-150 ease-out hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            {/* The icon points right; flip it so it points "forward" in RTL. */}
            <HiPaperAirplane className="h-5 w-5 -scale-x-100" />
          </button>
        </form>
      </div>
    </div>
  );
}

function DaySeparator({ label }: { label: string }) {
  return (
    <div className="my-4 flex justify-center first:mt-0">
      <span className="rounded-pill bg-white px-3 py-1 font-sans text-[11px] font-medium text-ink/50 shadow-sm ring-1 ring-ink/5">
        {label}
      </span>
    </div>
  );
}

type BubbleProps = {
  text: string;
  isMine: boolean;
  tail: boolean;
  className?: string;
  dimmed?: boolean;
};

// In RTL, "start" is the right side: my messages sit on the right, theirs on the left.
function Bubble({ text, isMine, tail, className = '', dimmed = false }: BubbleProps) {
  const shape = isMine
    ? `self-start bg-gradient-to-br from-navy-soft to-navy text-white ${tail ? 'rounded-es-md' : ''}`
    : `self-end bg-white text-ink ring-1 ring-ink/[0.07] ${tail ? 'rounded-ee-md' : ''}`;

  return (
    <p
      className={`max-w-[80%] rounded-2xl px-3.5 py-2 font-sans text-sm leading-relaxed break-words whitespace-pre-wrap shadow-sm sm:max-w-[70%] ${shape} ${dimmed ? 'opacity-60' : ''} ${className}`}
    >
      {text}
    </p>
  );
}

function MessageMeta({ isMine, time, seen }: { isMine: boolean; time: string; seen: boolean }) {
  return (
    <p
      className={`mt-1 flex items-center gap-1 font-sans text-[11px] tabular-nums text-ink/40 ${isMine ? 'self-start' : 'self-end'}`}
    >
      {time}
      {isMine && (
        <span
          className={`relative inline-flex h-3.5 ${seen ? 'w-4.5 text-sky-500' : 'w-3.5'}`}
          aria-label={seen ? 'נקרא' : 'נשלח'}
          title={seen ? 'נקרא' : 'נשלח'}
        >
          <HiCheck className="absolute top-0 left-0 h-3.5 w-3.5" />
          {seen && <HiCheck className="absolute top-0 left-1 h-3.5 w-3.5" />}
        </span>
      )}
    </p>
  );
}
