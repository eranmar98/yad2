import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import type { ChatMessage, Conversation } from '../../../services/inquiriesServices';
import ConversationList from './ConversationList';
import ChatThread from './ChatThread';

type MessengerProps = {
  conversations: Conversation[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (conversationId: string | null) => void;
  onRead: (conversationId: string) => void;
  onMessageSent: (conversationId: string, message: ChatMessage) => void;
};

/**
 * Two-pane messenger: conversation list + open thread. On small screens only
 * one pane shows at a time, and the thread has a back button to the list.
 */
export default function Messenger({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  onRead,
  onMessageSent,
}: MessengerProps) {
  const selected = conversations.find((c) => c._id === selectedId) ?? null;

  return (
    <div className="flex h-[calc(100dvh-14rem)] min-h-[540px] overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
      <ConversationList
        conversations={conversations}
        isLoading={isLoading}
        selectedId={selectedId}
        onSelect={onSelect}
        className={selectedId ? 'hidden lg:flex' : 'flex w-full'}
      />

      <div className={`min-w-0 flex-1 flex-col ${selectedId ? 'flex' : 'hidden lg:flex'}`}>
        {selectedId ? (
          <ChatThread
            key={selectedId}
            conversationId={selectedId}
            fallback={selected}
            onBack={() => onSelect(null)}
            onRead={onRead}
            onMessageSent={onMessageSent}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-ink/[0.015] p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-navy text-white shadow-sm">
              <HiOutlineChatBubbleLeftRight className="h-8 w-8" />
            </span>
            <p className="font-display text-lg font-bold text-ink">בחרו שיחה</p>
            <p className="max-w-xs font-sans text-sm text-ink/55">
              כאן מתנהלות כל השיחות שלך עם קונים שמתעניינים במודעות שלך ועם מוכרים שפנית אליהם.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
