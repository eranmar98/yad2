import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChatBubbleLeftRight, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import type { Conversation } from '../../../services/inquiriesServices';
import ChatAvatar from './ChatAvatar';
import { displayName, formatListTime } from './chatUtils';

type Filter = 'all' | 'seller' | 'buyer';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'הכל' },
  { value: 'seller', label: 'מכירות' },
  { value: 'buyer', label: 'קניות' },
];

type ConversationListProps = {
  conversations: Conversation[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
  className?: string;
};

export default function ConversationList({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  className = '',
}: ConversationListProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const visible = conversations.filter((c) => {
    if (filter !== 'all' && c.role !== filter) return false;
    if (!normalizedQuery) return true;
    return (
      displayName(c).toLowerCase().includes(normalizedQuery) ||
      (c.item?.title ?? '').toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <div className={`min-h-0 flex-col border-ink/10 lg:w-80 lg:shrink-0 lg:border-l ${className}`}>
      <div className="flex flex-col gap-3 border-b border-ink/10 p-4">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי שם או מודעה"
            className="w-full rounded-pill border border-ink/10 bg-ink/[0.03] py-2.5 pr-10 pl-4 font-sans text-sm text-ink outline-none transition-colors duration-150 ease-out placeholder:text-ink/40 focus:border-navy focus:bg-white"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-pill px-3.5 py-1.5 font-sans text-xs font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
                filter === option.value
                  ? 'bg-navy text-white'
                  : 'bg-ink/[0.04] text-ink/60 hover:bg-ink/[0.08]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <ListSkeleton />
        ) : conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy/5 text-navy">
              <HiOutlineChatBubbleLeftRight className="h-7 w-7" />
            </span>
            <p className="font-display font-bold text-ink">עוד אין שיחות</p>
            <p className="font-sans text-sm text-ink/55">
              כשמישהו יפנה למודעה שלך, או כשתפנו למוכר — השיחה תופיע כאן.
            </p>
            <Link to="/browse" className="font-sans text-sm font-medium text-navy hover:underline">
              לעיון במודעות
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <p className="px-6 py-12 text-center font-sans text-sm text-ink/50">לא נמצאו שיחות</p>
        ) : (
          <ul className="flex flex-col p-2">
            {visible.map((conversation) => {
              const isSelected = conversation._id === selectedId;
              const hasUnread = conversation.unreadCount > 0;
              return (
                <li key={conversation._id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conversation._id)}
                    aria-current={isSelected ? 'true' : undefined}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-right transition-colors duration-150 ease-out ${
                      isSelected ? 'bg-navy/[0.07]' : 'hover:bg-ink/[0.03]'
                    }`}
                  >
                    <ChatAvatar conversation={conversation} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span
                          className={`truncate font-sans text-sm text-ink ${hasUnread ? 'font-bold' : 'font-medium'}`}
                        >
                          {displayName(conversation)}
                        </span>
                        <span
                          className={`shrink-0 font-sans text-[11px] tabular-nums ${hasUnread ? 'font-bold text-navy' : 'text-ink/40'}`}
                        >
                          {formatListTime(conversation.updatedAt)}
                        </span>
                      </span>
                      <span className="block truncate font-sans text-xs text-ink/45">
                        {conversation.item?.title ?? 'מודעה שהוסרה'}
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span
                          className={`truncate font-sans text-xs ${hasUnread ? 'font-medium text-ink' : 'text-ink/55'}`}
                        >
                          {conversation.lastMessage
                            ? `${conversation.lastMessage.isMine ? 'אני: ' : ''}${conversation.lastMessage.text}`
                            : ''}
                        </span>
                        {hasUnread && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-pill bg-navy px-1.5 font-sans text-[10px] font-bold tabular-nums text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-2" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-ink/[0.06]" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3 w-1/2 animate-pulse rounded bg-ink/[0.06]" />
            <div className="h-2.5 w-3/4 animate-pulse rounded bg-ink/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}
