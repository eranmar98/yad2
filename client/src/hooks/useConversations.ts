import { useCallback, useState } from 'react';
import InquiriesServices, { type ChatMessage, type Conversation } from '../services/inquiriesServices';
import usePolling from './usePolling';

/** The user's chat conversations, kept fresh by polling the server. */
export default function useConversations(pollMs: number) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setConversations(await InquiriesServices.getConversations());
    } finally {
      setIsLoading(false);
    }
  }, []);

  usePolling(refresh, pollMs);

  // Local updates so the list reacts instantly, before the next poll confirms them.
  const markRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === conversationId && c.unreadCount > 0 ? { ...c, unreadCount: 0 } : c)),
    );
  }, []);

  const applySentMessage = useCallback((conversationId: string, message: ChatMessage) => {
    setConversations((prev) =>
      prev
        .map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: { text: message.text, createdAt: message.createdAt, isMine: true },
                updatedAt: message.createdAt,
              }
            : c,
        )
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    );
  }, []);

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return { conversations, isLoading, unreadTotal, refresh, markRead, applySentMessage };
}
